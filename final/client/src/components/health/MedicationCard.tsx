import { useEffect, useState } from "react";
import { Pill, Trash2 } from "lucide-react";
import HealthCard from "./HealthCard";
import CardHeader from "./CardHeader";
import EmptyState from "./EmptyState";
import HealthModal from "./HealthModal";
import { api } from "@/lib/api";
import type { Medication } from "@/lib/types";

const MEDICATION_OPTIONS = ["Prenatal Vitamin","Folic Acid","Iron Supplement","Vitamin D & Calcium","Omega-3 Fatty Acids","Over-the-Counter Medication"];

export default function MedicationCard() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [dosages, setDosages] = useState<Record<string,string>>({});
  const [frequencies, setFrequencies] = useState<Record<string,string>>({});
  const [error, setError] = useState<string|null>(null);

  async function loadMedications(){ try { setMedications(await api.getMedications()); } catch(e){ console.error(e); } }
  useEffect(()=>{ void loadMedications(); },[]);
  function toggle(name:string){ setSelected(p=>p.includes(name)?p.filter(x=>x!==name):[...p,name]); }

  async function saveMedications(){
    if(!selected.length){setError("Select at least one medication or supplement.");return;}
    if(selected.some(n=>!dosages[n]?.trim())){setError("Enter the prescribed dosage in mg for each selected medicine.");return;}
    if(selected.some(n=>!frequencies[n]?.trim())){setError("Enter the prescribed frequency for each selected medicine.");return;}
    setError(null);
    try {
      for(const name of selected){
        await api.createMedication({name,dosage:dosages[name].trim(),frequency:frequencies[name].trim(),notes:null,active:true});
      }
      setSelected([]);setDosages({});setFrequencies({});setOpen(false);void loadMedications();
    } catch(e){setError((e as Error).message);}
  }
  async function removeMedication(id:string){await api.deleteMedication(id);void loadMedications();}
  const activeCount=medications.filter(m=>m.active).length;

  return <>
    <HealthModal open={open} onClose={()=>setOpen(false)} title="Add Medication" subtitle="Record your prescribed medicines or supplements" icon={<Pill className="w-7 h-7 text-brand-600" />}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Enter the dosage prescribed by your doctor. Dosage is recorded in mg; there is no arbitrary 10 g maximum.</p>
        {MEDICATION_OPTIONS.map(name=><div key={name} className={`rounded-2xl border p-4 ${selected.includes(name)?'border-brand-400 bg-brand-50/50':'border-gray-100'}`}>
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={selected.includes(name)} onChange={()=>toggle(name)} className="w-4 h-4 accent-brand-500"/><span className="font-medium text-gray-800">{name}</span></label>
          {selected.includes(name)&&<div className="grid grid-cols-2 gap-3 mt-3">
            <div><label className="block text-xs text-gray-500 mb-1">Dosage (mg) *</label><input type="text" value={dosages[name]??''} onChange={e=>setDosages(d=>({...d,[name]:e.target.value}))} className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="e.g. 400 mg"/></div>
            <div><label className="block text-xs text-gray-500 mb-1">Frequency *</label><input type="text" value={frequencies[name]??''} onChange={e=>setFrequencies(f=>({...f,[name]:e.target.value}))} className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="e.g. once daily"/></div>
          </div>}
        </div>)}
        {error&&<div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
        <div className="flex gap-3"><button onClick={()=>setOpen(false)} className="flex-1 rounded-xl border py-3">Cancel</button><button onClick={saveMedications} className="flex-1 rounded-xl bg-brand-500 text-white py-3">Save</button></div>
      </div>
    </HealthModal>
    <HealthCard>
      <CardHeader icon={<Pill className="w-7 h-7 text-brand-600" />} iconBgClassName="bg-brand-50" title="Medications & Supplements" subtitle="Track your prescribed medicines and supplements" buttonText="+ Add Medication" onClick={()=>setOpen(true)} />
      <div className="px-6 pb-6">
        {medications.length===0?<EmptyState icon={<Pill className="w-10 h-10 text-brand-400"/>} bgClassName="bg-brand-50" title="No medications or supplements logged yet." description="Track medicines and supplements prescribed by your healthcare provider."/>:<>
          <div className="rounded-3xl bg-gradient-to-br from-brand-500 to-brand-500 text-white p-6"><p className="text-brand-100">Active Medications</p><h2 className="text-5xl font-bold mt-2">{activeCount}</h2><p className="text-brand-100 mt-3">Currently being taken</p></div>
          <h3 className="font-semibold mt-6 mb-4">Your Medications</h3>
          <div className="space-y-3">{medications.map(m=><div key={m.id} className="flex justify-between items-center rounded-2xl border border-gray-100 p-4"><div><h4 className="font-semibold">{m.name}</h4><p className="text-sm text-gray-500">{m.dosage||'No dosage'}</p><p className="text-sm text-gray-400">{m.frequency||'No frequency'}</p></div><button onClick={()=>removeMedication(m.id)} className="rounded-xl p-2 hover:bg-red-50 hover:text-red-500"><Trash2 className="w-5 h-5"/></button></div>)}</div>
        </>}
      </div>
    </HealthCard>
  </>;
}
