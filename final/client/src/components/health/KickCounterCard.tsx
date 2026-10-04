import { useEffect, useRef, useState } from "react";
import { Footprints, Trash2, Plus } from "lucide-react";

import HealthCard from "./HealthCard";
import CardHeader from "./CardHeader";
import EmptyState from "./EmptyState";

interface KickSession {
  id: string;
  date: string;
  kicks: number;
  durationSec: number;
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function KickCounterCard() {
  const [sessions, setSessions] = useState<KickSession[]>([]);
  const [active, setActive] = useState(false);
  const [kicks, setKicks] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active) {
      timerRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active]);

  function startSession() {
    setKicks(0);
    setElapsed(0);
    setActive(true);
  }

  function endSession() {
    setActive(false);

    if (kicks > 0) {
      setSessions((prev) => [
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          kicks,
          durationSec: elapsed,
        },
        ...prev,
      ]);
    }
  }

  function removeSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <HealthCard>

      <CardHeader
        icon={<Footprints className="w-7 h-7 text-orange-500" />}
        iconBgClassName="bg-orange-50"
        title="Kick Counter"
        subtitle="Track your baby's movements"
        buttonText="+ Start Session"
        onClick={startSession}
      />

      <div className="px-6 pb-6">

        {active ? (

          <div className="rounded-3xl bg-gradient-to-br from-orange-400 to-amber-500 p-6 text-white text-center">

            <p className="text-orange-50">
              Session in progress
            </p>

            <h2 className="text-6xl font-bold mt-3">
              {kicks}
            </h2>

            <p className="mt-1 text-orange-50">
              kicks · {formatDuration(elapsed)}
            </p>

            <div className="flex justify-center gap-3 mt-6">

              <button
                onClick={() => setKicks((k) => k + 1)}
                className="flex items-center gap-2 rounded-2xl bg-white text-orange-600 px-6 py-3 font-semibold shadow-lg hover:scale-105 transition"
              >
                <Plus className="w-5 h-5" />
                Log Kick
              </button>

              <button
                onClick={endSession}
                className="rounded-2xl bg-white/20 hover:bg-white/30 px-6 py-3 font-semibold transition"
              >
                End Session
              </button>

            </div>

          </div>

        ) : sessions.length === 0 ? (

          <EmptyState
            icon={<Footprints className="w-10 h-10 text-orange-400" />}
            bgClassName="bg-orange-50"
            title="No kick sessions yet."
            description="Start a session to track your baby's movements."
          />

        ) : (

          <>

            <h3 className="font-semibold mt-2 mb-4">
              Recent Sessions
            </h3>

            <div className="space-y-3">

              {sessions.slice(0, 5).map((session) => (

                <div
                  key={session.id}
                  className="flex justify-between items-center rounded-2xl border border-gray-100 p-4 hover:bg-orange-50 transition"
                >

                  <div>

                    <h4 className="font-semibold">
                      {session.kicks} kicks
                    </h4>

                    <p className="text-sm text-gray-500">
                      {formatDateShort(session.date)} · {formatDuration(session.durationSec)}
                    </p>

                  </div>

                  <button
                    onClick={() => removeSession(session.id)}
                    className="rounded-xl p-2 text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                </div>

              ))}

            </div>

          </>

        )}

      </div>

    </HealthCard>
  );
}
