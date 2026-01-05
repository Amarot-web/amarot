import {
  getLeadStages,
  getLeadsByStage,
  getLostLeadsByStage,
  getPipelineSummary,
  getLeadAlertsMap,
  getLeadsByClosingMonth,
} from '@/lib/crm/queries';
import PipelineClient from './PipelineClient';

export const dynamic = 'force-dynamic';

export default async function CRMPage() {
  // Fetch data in parallel
  const [stages, leadsByStageMap, lostLeadsByStageMap, summary, alertsMap, forecastColumns] = await Promise.all([
    getLeadStages(),
    getLeadsByStage(),
    getLostLeadsByStage(),
    getPipelineSummary(),
    getLeadAlertsMap(),
    getLeadsByClosingMonth(),
  ]);

  // Convert Map to Record for client component
  const leadsByStage: Record<string, typeof leadsByStageMap extends Map<string, infer V> ? V : never> = {};
  leadsByStageMap.forEach((leads, stageId) => {
    leadsByStage[stageId] = leads;
  });

  // Convert lost leads Map to Record
  const lostLeadsByStage: Record<string, typeof lostLeadsByStageMap extends Map<string, infer V> ? V : never> = {};
  lostLeadsByStageMap.forEach((leads, stageId) => {
    lostLeadsByStage[stageId] = leads;
  });

  // Ensure all stages have an entry
  stages.forEach((stage) => {
    if (!leadsByStage[stage.id]) {
      leadsByStage[stage.id] = [];
    }
    if (!lostLeadsByStage[stage.id]) {
      lostLeadsByStage[stage.id] = [];
    }
  });

  return (
    <PipelineClient
      stages={stages}
      leadsByStage={leadsByStage}
      lostLeadsByStage={lostLeadsByStage}
      summary={summary}
      alertsMap={alertsMap}
      forecastColumns={forecastColumns}
    />
  );
}
