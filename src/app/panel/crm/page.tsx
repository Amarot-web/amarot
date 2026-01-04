import {
  getLeadStages,
  getLeadsByStage,
  getPipelineSummary,
  getLeadAlertsMap,
  getLeadsByClosingMonth,
} from '@/lib/crm/queries';
import PipelineClient from './PipelineClient';

export const dynamic = 'force-dynamic';

export default async function CRMPage() {
  // Fetch data in parallel
  const [stages, leadsByStageMap, summary, alertsMap, forecastColumns] = await Promise.all([
    getLeadStages(),
    getLeadsByStage(),
    getPipelineSummary(),
    getLeadAlertsMap(),
    getLeadsByClosingMonth(),
  ]);

  // Convert Map to Record for client component
  const leadsByStage: Record<string, typeof leadsByStageMap extends Map<string, infer V> ? V : never> = {};
  leadsByStageMap.forEach((leads, stageId) => {
    leadsByStage[stageId] = leads;
  });

  // Ensure all stages have an entry
  stages.forEach((stage) => {
    if (!leadsByStage[stage.id]) {
      leadsByStage[stage.id] = [];
    }
  });

  return (
    <PipelineClient
      stages={stages}
      leadsByStage={leadsByStage}
      summary={summary}
      alertsMap={alertsMap}
      forecastColumns={forecastColumns}
    />
  );
}
