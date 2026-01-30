import { ProviderLogo } from '@/components/providers/ProviderLogo';
import { StatusIcon } from '@/components/status/StatusIcon';
import { WorkflowIcon } from '@/components/workflow/WorkflowIcon';

export default function TestImagesPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-8">Image Migration Test Page</h1>

      <section>
        <h2 className="text-xl font-bold mb-4">Provider Logos</h2>
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex flex-col items-center gap-2">
            <ProviderLogo provider="aws" size={48} />
            <span className="text-sm">AWS</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ProviderLogo provider="azure" size={48} />
            <span className="text-sm">Azure</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ProviderLogo provider="gcp" size={48} />
            <span className="text-sm">GCP</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ProviderLogo provider="alibaba" size={48} />
            <span className="text-sm">Alibaba</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ProviderLogo provider="tencent" size={48} />
            <span className="text-sm">Tencent</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ProviderLogo provider="ncpvpc" size={48} />
            <span className="text-sm">NCP VPC</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ProviderLogo provider="mcmp" size={48} />
            <span className="text-sm">MCMP</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Status Icons</h2>
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex flex-col items-center gap-2">
            <StatusIcon status="running" size={32} />
            <span className="text-sm">Running</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <StatusIcon status="stop" size={32} />
            <span className="text-sm">Stop</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <StatusIcon status="terminate" size={32} />
            <span className="text-sm">Terminate</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <StatusIcon status="off" size={32} />
            <span className="text-sm">Off</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Workflow Icons</h2>
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex flex-col items-center gap-2">
            <WorkflowIcon type="save" size={32} />
            <span className="text-sm">Save</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <WorkflowIcon type="text" size={32} />
            <span className="text-sm">Text</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <WorkflowIcon type="filter" size={32} />
            <span className="text-sm">Filter</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <WorkflowIcon type="if" size={32} />
            <span className="text-sm">If</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <WorkflowIcon type="loop" size={32} />
            <span className="text-sm">Loop</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <WorkflowIcon type="task" size={32} />
            <span className="text-sm">Task</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Direct Image Access Test</h2>
        <div className="space-y-2 text-sm">
          <p>Test these URLs in browser:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">/images/providers/aws.png</code>
            </li>
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">/images/status/running.svg</code>
            </li>
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">/images/workflow/save.svg</code>
            </li>
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">/favicon.ico</code>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
