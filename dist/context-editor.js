import {validateGraph} from './engine.js';
export function saveContextRecord(graph,kind,record){
  if(!['node','edge'].includes(kind))throw new Error('Unknown record kind.');
  const copy=structuredClone(graph),key=kind==='node'?'nodes':'edges';
  for(const field of ['id','owner',kind==='edge'?'sourceRef':'source','observedAt','classification','confidence','state'])if(typeof record[field]!=='string'||!record[field].trim())throw new Error(`${field} is required.`);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(record.observedAt)||!Number.isFinite(Date.parse(record.observedAt))||new Date(record.observedAt).toISOString().slice(0,10)!==record.observedAt)throw new Error('A valid evidence date is required.');
  if(record.validUntil&&(!/^\d{4}-\d{2}-\d{2}$/.test(record.validUntil)||!Number.isFinite(Date.parse(record.validUntil))||new Date(record.validUntil).toISOString().slice(0,10)!==record.validUntil||record.validUntil<record.observedAt))throw new Error('Validity end must be a valid date on or after evidence date.');
  if(!['observed','approved-plan','hypothesis'].includes(record.state))throw new Error('Choose a fact state.');
  if(!['Public','Internal','Confidential','Restricted'].includes(record.classification))throw new Error('Choose an access classification.');
  if(!['High','Medium','Low'].includes(record.confidence))throw new Error('Choose a confidence level.');
  const index=copy[key].findIndex(r=>r.id===record.id);
  const next={...(index>=0?copy[key][index]:{}),...record};
  if(kind==='edge'&&next.source===next.target)throw new Error('Choose different source and target entities.');
  if(index>=0)copy[key][index]=next;else copy[key].push(next);
  copy.meta={...copy.meta,editedAt:new Date().toISOString(),userEdited:true};
  return validateGraph(copy);
}
