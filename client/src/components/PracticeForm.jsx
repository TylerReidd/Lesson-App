import React, { useMemo, useState } from "react";
import axios from "../axios.js";

const todayISO = () => new Date().toISOString().slice(0,10); // YYYY-MM-DD

export default function PracticeForm() {
  const [form, setForm] = useState({
    date: todayISO(),
    startTime: "18:00",
    endTime: "19:00",
    focus: "",
    struggles: "",
    wins: "",
    notes: "",
    metronome: false,
    bpm: "",
    rating: 3
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const durationMin = useMemo(() => {
    if (!form.startTime || !form.endTime) return 0;
    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    return Math.max((eh*60 + em) - (sh*60 + sm), 0);
  }, [form.startTime, form.endTime]);

  const change = (e) => {
    const { name, type, value, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(""); setSubmitting(true);
    try {
      await axios.post("/practice", form, { withCredentials: true });
      setMsg("Saved! Your teacher can see this entry.");
      // (optional) reset focus/notes but keep date/times:
      setForm(f => ({ ...f, focus:"", struggles:"", wins:"", notes:"" }));
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section >
      <div className="panel-h">Daily Practice / Study Log</div>
      <div className="panel-b">
        <form onSubmit={submit} className="form">
          <div className="" style={{gap:12}}>
            <label style={{flex:1}}>
              Date
              <input className="input" type="date" name="date" value={form.date} onChange={change} />
            </label>
            <label style={{flex:1}}>
              Start
              <input className="input" type="time" name="startTime" value={form.startTime} onChange={change} />
            </label>
            <label style={{flex:1}}>
              End
              <input className="input" type="time" name="endTime" value={form.endTime} onChange={change} />
            </label>
            <div className="">
              <div className="muted">Duration</div>
              <div style={{marginLeft:8, fontWeight:700}}>{durationMin} min</div>
            </div>
          </div>

          <label>
            What did you focus on?
            <textarea className="input" name="focus" rows={3} placeholder="Scales, reading, chord changes, repertoire…" value={form.focus} onChange={change} />
          </label>

          <div className="">
            <label>
              Things you struggled with
              <textarea className="input" name="struggles" rows={3} value={form.struggles} onChange={change} />
            </label>
            <label>
              Things that went well
              <textarea className="input" name="wins" rows={3} value={form.wins} onChange={change} />
            </label>
          </div>

          <div className="grid grid-sm-2">
            <label>
              Notes (optional)
              <textarea className="input" name="notes" rows={3} value={form.notes} onChange={change} />
            </label>

            <div>
              {/* <label className="" style={{gap:8, marginBottom:8}}>
                <input type="checkbox" name="metronome" checked={form.metronome} onChange={change} />
                Used metronome
              </label>
              <label>
                BPM (if used)
                <input className="input" name="bpm" type="number" min="20" max="300" value={form.bpm} onChange={change} placeholder="e.g. 80" />
              </label> */}

            </div>
              <label style={{marginTop:10}}>
                Session rating (1–5)
                <input className="input" name="rating" type="number" min="1" max="5" value={form.rating} onChange={change} />
              </label>
          </div>

          {msg && <div className="mt-12">{msg}</div>}

          <div className="mt-12">
            <button className="button-primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Submit Practice Log'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
