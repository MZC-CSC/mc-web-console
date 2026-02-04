'use client';

import { useRef, useEffect, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiPost } from '@/lib/api/client';
import { OPERATION_IDS } from '@/constants/api';
import { toastError } from '@/lib/utils/toast';
import { FileTransfer } from './FileTransfer';
import type { TerminalModalProps } from '@/types/mci-workloads';

interface TerminalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nsId: string;
  mciId: string;
  subGroupId?: string; // Optional: MCI 레벨에서는 필요 없음
  vmId?: string; // Optional: MCI 레벨에서는 필요 없음
  vmName?: string; // Optional: MCI 레벨에서는 필요 없음
}

/**
 * Remote Command Terminal Modal
 * XTerm.js 기반 터미널 모달로, VM에 원격 명령어를 실행할 수 있습니다.
 */
export function TerminalModal({
  open,
  onOpenChange,
  nsId,
  mciId,
  subGroupId,
  vmId,
  vmName,
}: TerminalModalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isTerminalReady, setIsTerminalReady] = useState(false);

  // Terminal 초기화
  useEffect(() => {
    console.log('=== Terminal useEffect triggered ===', { open, hasRef: !!terminalRef.current });

    if (!open) {
      console.log('Terminal initialization skipped: dialog not open');
      return;
    }

    // Dialog Portal이 마운트될 때까지 대기
    if (!terminalRef.current) {
      console.log('Waiting for terminal ref to be ready...');
      const checkRef = setInterval(() => {
        if (terminalRef.current) {
          console.log('Terminal ref is now ready!');
          clearInterval(checkRef);
          initializeTerminal();
        }
      }, 50);

      // 최대 2초 대기
      setTimeout(() => {
        clearInterval(checkRef);
        if (!terminalRef.current) {
          console.error('Terminal ref timeout - DOM element not found');
        }
      }, 2000);

      return () => clearInterval(checkRef);
    } else {
      // ref가 이미 준비되어 있으면 즉시 초기화
      initializeTerminal();
    }
  }, [open, vmName]);

  // Terminal 초기화 로직을 별도 함수로 분리
  const initializeTerminal = () => {
    if (!terminalRef.current) {
      console.error('Cannot initialize: terminalRef.current is null');
      return;
    }

    console.log('Terminal container dimensions:', {
      width: terminalRef.current.offsetWidth,
      height: terminalRef.current.offsetHeight,
    });

    // 기존 터미널이 있으면 정리
    if (terminalInstanceRef.current) {
      console.log('Disposing existing terminal');
      terminalInstanceRef.current.dispose();
      terminalInstanceRef.current = null;
    }

    // 새 터미널 생성
    console.log('Creating new terminal instance');
    const term = new Terminal({
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff',
        cursor: '#ffcc00',
      },
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    console.log('Opening terminal in container');
    term.open(terminalRef.current);

    console.log('Fitting terminal to container');
    fitAddon.fit();

    terminalInstanceRef.current = term;
    fitAddonRef.current = fitAddon;

    // 터미널 준비 완료 상태 업데이트
    setIsTerminalReady(true);
    console.log('Terminal is ready - ScriptUpload should now be enabled');

    // 환영 메시지
    console.log('Writing welcome message');
    term.writeln('╔═══════════════════════════════════════════════╗');
    term.writeln('║  Remote Terminal                              ║');
    if (vmName) {
      term.writeln(`║  VM: ${vmName.padEnd(40)}║`);
    }
    term.writeln('╚═══════════════════════════════════════════════╝');
    term.writeln('');

    // 초기 프롬프트 표시
    console.log('Writing initial prompt');
    term.write(' $ ');

    // 초기 IP 확인 명령어 실행
    const initCmd = "client_ip=$(echo $SSH_CLIENT | awk '{print $1}'); echo SSH Private IP is: $client_ip";
    executeCommand([initCmd], term);

    // 사용자 입력 처리
    let currentInput = '';
    term.onData((data) => {
      console.log('Terminal onData:', { data, charCode: data.charCodeAt(0), currentInput });

      if (data === '\r') {
        // Enter 키
        const command = currentInput;
        currentInput = '';
        term.write('\r\n');
        executeCommand([command], term);
      } else if (data === '\u007f') {
        // Backspace
        if (currentInput.length > 0) {
          term.write('\b \b');
          currentInput = currentInput.slice(0, -1);
        }
      } else {
        // 일반 문자
        if (/^[a-zA-Z0-9 !@#$%^&*()_\-+=\[\]{}|;:'",.<>/?\\~`]$/.test(data)) {
          term.write(data);
          currentInput += data;
        } else {
          console.warn('Ignored character:', data, 'charCode:', data.charCodeAt(0));
        }
      }
    });

    // 터미널에 포커스 설정
    setTimeout(() => {
      term.focus();
      console.log('Terminal focused');
    }, 100);

    // 윈도우 리사이즈 핸들러
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup 함수 반환
    return () => {
      console.log('Cleaning up terminal');
      window.removeEventListener('resize', handleResize);
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.dispose();
        terminalInstanceRef.current = null;
      }
      setIsTerminalReady(false);
    };
  };

  // 명령어 실행
  const executeCommand = async (commands: string[], term: Terminal) => {
    if (!commands || commands.length === 0 || commands[0].trim() === '') {
      writePrompt(term);
      return;
    }

    // 로딩 인디케이터
    const loadingSymbols = ['|', '/', '-', '\\'];
    let loadingIndex = 0;
    const loadingInterval = setInterval(() => {
      term.write(`\r     ${loadingSymbols[loadingIndex]} Processing...`);
      loadingIndex = (loadingIndex + 1) % loadingSymbols.length;
    }, 250);

    try {
      // queryParams는 선택사항 (subGroupId, vmId)
      const queryParams: Record<string, string> = {};
      if (subGroupId) queryParams.subGroupId = subGroupId;
      if (vmId) queryParams.vmId = vmId;

      console.log('Executing command with params:', { nsId, mciId, subGroupId, vmId, queryParams });

      const result = await apiPost(OPERATION_IDS.POST_CMD_MCI, {
        pathParams: { nsId, mciId },
        queryParams,
        Request: {
          command: commands,
          userName: 'cb-user',
        },
      });

      clearInterval(loadingInterval);
      term.write('\r                          \r');

      console.log('Command result:', result);

      // apiPost 응답은 responseData에 포함됨 (프로젝트 일관성 유지)
      const results = result.responseData?.results || [];
      if (results.length === 0) {
        term.write('\x1b[1m\x1b[31mError: No response from server\x1b[0m\r\n');
        writePrompt(term);
        return;
      }

      // 모든 VM의 결과를 순회하며 출력
      results.forEach((response: any, index: number) => {
        const { err, error, stdout, stderr, vmId: responseVmId, vmIp } = response;

        // VM 정보 표시 (여러 VM에 명령을 보낸 경우)
        if (results.length > 1 || !vmId) {
          term.write(`\x1b[1m\x1b[36m─── VM: ${responseVmId || 'unknown'} (${vmIp || 'N/A'}) ───\x1b[0m\r\n`);
        }

        // 에러 처리 (err 객체 또는 error 문자열)
        const errorMessage = err || error;
        if (errorMessage) {
          if (typeof errorMessage === 'string') {
            term.write(`\x1b[1m\x1b[31mError: ${errorMessage}\x1b[0m\r\n`);
          } else {
            const formattedError = JSON.stringify(errorMessage, null, 2);
            term.write(`\x1b[1m\x1b[31mConnection Error:\r\n${formattedError}\x1b[0m\r\n`);
          }
        }

        // stderr 출력
        if (stderr && Object.values(stderr).some((v: any) => v.trim() !== '')) {
          term.write('\x1b[1m\x1b[31mSTDERR:\r\n');
          Object.values(stderr).forEach((value: any) => {
            writeAutoWrap(term, value);
          });
          term.write('\x1b[0m');
        }

        // stdout 출력
        if (stdout && Object.values(stdout).some((v: any) => v.trim() !== '')) {
          Object.values(stdout).forEach((value: any) => {
            writeAutoWrap(term, value);
          });
        } else if (!errorMessage) {
          // 에러가 없고 출력도 없을 때만 "(No output)" 표시
          term.write('(No output)\r\n');
        }

        // 여러 VM 결과 사이에 빈 줄 추가
        if (index < results.length - 1) {
          term.write('\r\n');
        }
      });

      writePrompt(term);
    } catch (error) {
      clearInterval(loadingInterval);
      term.write('\r                          \r');
      term.write(`\x1b[1m\x1b[31mError: ${error instanceof Error ? error.message : 'Unknown error'}\x1b[0m\r\n`);
      toastError('Failed to execute command');
      writePrompt(term);
    }
  };

  // 프롬프트 출력
  const writePrompt = (term: Terminal) => {
    term.write('\r\n $ ');
  };

  // 자동 줄바꿈 출력
  const writeAutoWrap = (term: Terminal, text: string) => {
    const cols = term.cols;
    let currentLine = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '\n') {
        term.write(currentLine + '\r\n');
        currentLine = '';
        continue;
      }
      currentLine += char;
      if (currentLine.length >= cols) {
        term.write(currentLine + '\r\n');
        currentLine = '';
      }
    }

    if (currentLine) {
      term.write(currentLine);
    }
  };

  // 연결 종료
  const handleDisconnect = () => {
    if (terminalInstanceRef.current) {
      terminalInstanceRef.current.dispose();
      terminalInstanceRef.current = null;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Remote Terminal{vmName ? ` - ${vmName}` : ''}</DialogTitle>
          <DialogDescription>
            Execute remote commands or transfer files {vmName ? 'to the VM' : 'to the MCI'}
          </DialogDescription>
        </DialogHeader>

        {/* Terminal Container - 항상 표시 */}
        <div className="flex-1 px-6 min-h-[400px] flex flex-col">
          <div className="text-sm font-medium mb-2">Terminal (Click here to focus)</div>
          <div
            ref={terminalRef}
            className="flex-1 bg-[#1e1e1e] rounded-md overflow-hidden min-h-[350px] border-2 border-blue-500"
            style={{ minHeight: '350px' }}
            onClick={() => {
              console.log('Terminal container clicked!');
              if (terminalInstanceRef.current) {
                terminalInstanceRef.current.focus();
                console.log('Terminal focus() called');
              } else {
                console.error('Terminal instance is null!');
              }
            }}
          />
        </div>

        {/* File Transfer */}
        <div className="px-6 py-4">
          <FileTransfer
            nsId={nsId}
            mciId={mciId}
            subGroupId={subGroupId}
            vmId={vmId}
            disabled={!isTerminalReady}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <Button variant="destructive" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
