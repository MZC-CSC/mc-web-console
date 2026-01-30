'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Platform Settings 페이지
 *
 * 플랫폼 설정 관리
 * - 일반 설정
 * - 보안 설정
 * - 알림 설정
 * - 시스템 설정
 * - TODO: Backend API 준비 필요 (플랫폼 설정 API가 api.yaml에 없음)
 * - 향후 설정 조회/저장 API 추가 후 연동
 */

interface PlatformSettings {
  // 일반 설정
  platformName: string;
  platformUrl: string;
  supportEmail: string;
  maxUsers: number;

  // 보안 설정
  sessionTimeout: number;
  passwordMinLength: number;
  enableMfa: boolean;
  allowPublicSignup: boolean;

  // 알림 설정
  emailNotifications: boolean;
  slackNotifications: boolean;
  webhookUrl: string;

  // 시스템 설정
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  dataRetentionDays: number;
  enableMetrics: boolean;
  enableAuditLog: boolean;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  platformName: 'MC Web Console',
  platformUrl: 'https://console.example.com',
  supportEmail: 'support@example.com',
  maxUsers: 100,
  sessionTimeout: 3600,
  passwordMinLength: 8,
  enableMfa: false,
  allowPublicSignup: false,
  emailNotifications: true,
  slackNotifications: false,
  webhookUrl: '',
  logLevel: 'info',
  dataRetentionDays: 90,
  enableMetrics: true,
  enableAuditLog: true,
};

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('general');

  const handleSave = async () => {
    setLoading(true);
    // TODO: API 연동 - 설정 저장
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('설정을 기본값으로 되돌리시겠습니까?')) {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const updateSetting = (key: keyof PlatformSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground mt-2">
            플랫폼 설정 및 구성 관리
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* 설정 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* General 탭 */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input
                  id="platformName"
                  value={settings.platformName}
                  onChange={(e) => updateSetting('platformName', e.target.value)}
                  placeholder="MC Web Console"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platformUrl">Platform URL</Label>
                <Input
                  id="platformUrl"
                  type="url"
                  value={settings.platformUrl}
                  onChange={(e) => updateSetting('platformUrl', e.target.value)}
                  placeholder="https://console.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => updateSetting('supportEmail', e.target.value)}
                  placeholder="support@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUsers">Maximum Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={settings.maxUsers}
                  onChange={(e) => updateSetting('maxUsers', parseInt(e.target.value))}
                  min="1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security 탭 */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                  min="300"
                />
                <p className="text-xs text-muted-foreground">
                  Current: {Math.floor(settings.sessionTimeout / 60)} minutes
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
                  min="6"
                  max="32"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableMfa">Enable Multi-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">
                    Require MFA for all users
                  </p>
                </div>
                <Switch
                  id="enableMfa"
                  checked={settings.enableMfa}
                  onCheckedChange={(checked) => updateSetting('enableMfa', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowPublicSignup">Allow Public Signup</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow users to create accounts without invitation
                  </p>
                </div>
                <Switch
                  id="allowPublicSignup"
                  checked={settings.allowPublicSignup}
                  onCheckedChange={(checked) => updateSetting('allowPublicSignup', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications 탭 */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Send notifications via email
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="slackNotifications">Slack Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Send notifications to Slack
                  </p>
                </div>
                <Switch
                  id="slackNotifications"
                  checked={settings.slackNotifications}
                  onCheckedChange={(checked) => updateSetting('slackNotifications', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  value={settings.webhookUrl}
                  onChange={(e) => updateSetting('webhookUrl', e.target.value)}
                  placeholder="https://hooks.example.com/webhook"
                />
                <p className="text-xs text-muted-foreground">
                  Send notifications to custom webhook
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System 탭 */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logLevel">Log Level</Label>
                <select
                  id="logLevel"
                  value={settings.logLevel}
                  onChange={(e) => updateSetting('logLevel', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataRetentionDays">Data Retention (days)</Label>
                <Input
                  id="dataRetentionDays"
                  type="number"
                  value={settings.dataRetentionDays}
                  onChange={(e) => updateSetting('dataRetentionDays', parseInt(e.target.value))}
                  min="1"
                />
                <p className="text-xs text-muted-foreground">
                  How long to keep logs and metrics
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableMetrics">Enable Metrics Collection</Label>
                  <p className="text-xs text-muted-foreground">
                    Collect platform performance metrics
                  </p>
                </div>
                <Switch
                  id="enableMetrics"
                  checked={settings.enableMetrics}
                  onCheckedChange={(checked) => updateSetting('enableMetrics', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableAuditLog">Enable Audit Log</Label>
                  <p className="text-xs text-muted-foreground">
                    Log all user actions for compliance
                  </p>
                </div>
                <Switch
                  id="enableAuditLog"
                  checked={settings.enableAuditLog}
                  onCheckedChange={(checked) => updateSetting('enableAuditLog', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
