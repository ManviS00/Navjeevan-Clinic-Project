import HealthEntry from "../models/HealthEntry.js";
const shape = e => ({ ...e.data, id:String(e._id), user_id:String(e.user), created_at:e.createdAt, log_date:e.logDate });

export const list = async (req,res) => {
  const data=await HealthEntry.find({user:req.user.id,kind:req.params.kind}).sort({logDate:-1,createdAt:-1});
  res.json({success:true,data:data.map(shape)});
};
export const create = async (req,res) => {
  try {
    const kind=req.params.kind;
    if(!["weight","medication","nutrition","symptom"].includes(kind)) return res.status(400).json({success:false,message:"Invalid health entry type."});
    // Never trust client-provided identity/meta fields (id, user_id, created_at) —
    // spreading a previously-fetched record into a save payload should not let
    // stale values leak into `data` and shadow the real document's own fields.
    const { id, user_id, created_at, log_date, ...rest } = req.body;
    const data = { ...rest };
    const logDate = log_date || new Date().toISOString().slice(0,10);
    if(kind==="weight" && Number(data.weight_kg)<=0) return res.status(400).json({success:false,message:"Weight must be greater than zero."});
    if(kind==="medication" && data.dosage && !/^[0-9]+(?:\.[0-9]+)?\s*(mg|mcg|g|ml|tablet(?:s)?|capsule(?:s)?)$/i.test(String(data.dosage).trim())) return res.status(400).json({success:false,message:"Medication dosage must include a valid amount and unit, e.g. 400 mg."});

    // Nutrition is a per-day log (meals + hydration + supplements all live on
    // one record per user per date), so saving again on the same day should
    // update that existing record instead of creating a duplicate. Duplicates
    // were the reason "delete latest log" looked broken — the id shown on
    // screen no longer matched any single authoritative row.
    if (kind === "nutrition") {
      const existing = await HealthEntry.findOne({ user: req.user.id, kind, logDate });
      if (existing) {
        existing.data = { ...existing.data, ...data };
        await existing.save();
        return res.status(200).json({ success: true, data: shape(existing) });
      }
    }

    const entry=await HealthEntry.create({user:req.user.id,kind,logDate,data});
    res.status(201).json({success:true,data:shape(entry)});
  } catch(e){res.status(400).json({success:false,message:e.message});}
};
export const remove = async (req,res) => {
  const e=await HealthEntry.findOneAndDelete({_id:req.params.id,user:req.user.id,kind:req.params.kind});
  if(!e) return res.status(404).json({success:false,message:"Entry not found."});
  res.json({success:true});
};
export const update = async (req,res) => {
  const e=await HealthEntry.findOne({_id:req.params.id,user:req.user.id,kind:req.params.kind});
  if(!e) return res.status(404).json({success:false,message:"Entry not found."});
  const { id, user_id, created_at, log_date, ...rest } = req.body;
  e.data={...e.data,...rest}; if(log_date) e.logDate=log_date; await e.save();
  res.json({success:true,data:shape(e)});
};
