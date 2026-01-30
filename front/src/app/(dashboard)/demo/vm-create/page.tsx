'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Rocket, Server } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * VM Create Demo 페이지
 *
 * VM 생성 데모 및 테스트
 * - VM 생성 폼
 * - 다단계 프로세스 시뮬레이션
 * - 생성 완료 메시지
 */

interface VMCreateForm {
  name: string;
  type: string;
  cpu: number;
  memory: number;
  disk: number;
  network: string;
}

export default function VMCreateDemoPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<VMCreateForm>({
    name: '',
    type: 't2.medium',
    cpu: 2,
    memory: 4096,
    disk: 50,
    network: 'default',
  });

  const updateForm = (key: keyof VMCreateForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    // 시뮬레이션: 3초 후 완료
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setLoading(false);
    setStep(4);
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">VM Create Demo</h1>
          <Badge variant="secondary">DEMO</Badge>
        </div>
        <p className="text-muted-foreground mt-2">
          VM 생성 데모 및 테스트 페이지
        </p>
      </div>

      {/* 진행 단계 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= s
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted bg-muted text-muted-foreground'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm">Basic Info</span>
            <span className="text-sm">Resources</span>
            <span className="text-sm">Review</span>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">VM Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                placeholder="my-vm-01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Instance Type</Label>
              <select
                id="type"
                value={form.type}
                onChange={(e) => updateForm('type', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="t2.micro">t2.micro (1 vCPU, 1 GB)</option>
                <option value="t2.small">t2.small (1 vCPU, 2 GB)</option>
                <option value="t2.medium">t2.medium (2 vCPU, 4 GB)</option>
                <option value="t2.large">t2.large (2 vCPU, 8 GB)</option>
                <option value="t2.xlarge">t2.xlarge (4 vCPU, 16 GB)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={handleNext} disabled={!form.name}>
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Resources */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Resource Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpu">CPU (vCPU)</Label>
              <Input
                id="cpu"
                type="number"
                value={form.cpu}
                onChange={(e) => updateForm('cpu', parseInt(e.target.value))}
                min="1"
                max="16"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memory">Memory (MB)</Label>
              <Input
                id="memory"
                type="number"
                value={form.memory}
                onChange={(e) => updateForm('memory', parseInt(e.target.value))}
                min="1024"
                step="1024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disk">Disk (GB)</Label>
              <Input
                id="disk"
                type="number"
                value={form.disk}
                onChange={(e) => updateForm('disk', parseInt(e.target.value))}
                min="10"
              />
            </div>
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext}>
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Review & Create</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">VM Name:</span>
                <span>{form.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Instance Type:</span>
                <Badge variant="outline">{form.type}</Badge>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">CPU:</span>
                <span>{form.cpu} vCPU</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Memory:</span>
                <span>{form.memory} MB</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Disk:</span>
                <span>{form.disk} GB</span>
              </div>
            </div>
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={handleBack} disabled={loading}>
                Back
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Create VM
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4 py-8">
              <div className="rounded-full bg-green-100 p-4">
                <Server className="h-16 w-16 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">VM Created Successfully!</h2>
                <p className="text-muted-foreground">
                  Your virtual machine <strong>{form.name}</strong> has been created.
                </p>
              </div>
              <div className="pt-4 flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Create Another
                </Button>
                <Button onClick={() => router.push('/demo/vm-list')}>
                  View VM List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo 안내 */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>Demo Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>프로세스:</strong> 3단계로 구성된 VM 생성 프로세스를 시뮬레이션합니다.
            </p>
            <p>
              <strong>생성 시간:</strong> VM 생성은 약 3초 정도 소요됩니다 (시뮬레이션).
            </p>
            <p>
              <strong>데이터:</strong> 실제 VM은 생성되지 않으며, 데모 목적입니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
