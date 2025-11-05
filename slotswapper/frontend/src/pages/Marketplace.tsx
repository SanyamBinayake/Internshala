import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";

export default function Marketplace() {
  const qc = useQueryClient();
  const { data: swappables = [] } = useQuery({
    queryKey: ["swappable"],
    queryFn: async () => (await api.get("/swap/swappable-slots")).data,
  });

  const { data: myEvents = [] } = useQuery({
    queryKey: ["events"],
    queryFn: async () => (await api.get("/events")).data,
  });

  const [offer, setOffer] = useState<Record<number, number | undefined>>({});

  const requestSwap = async (theirId: number) => {
    const myId = offer[theirId];
    if (!myId) return alert("Select one of your SWAPPABLE slots to offer!");
    await api.post("/swap/swap-request", { mySlotId: myId, theirSlotId: theirId });
    qc.invalidateQueries({ queryKey: ["requests"] });
    alert("Swap requested!");
  };

  return (
    <div>
      <h3>Marketplace — Swappable Slots</h3>
      <ul>
        {(swappables as any[]).map((e) => (
          <li key={e.id}>
            <b>{e.title}</b> ({new Date(e.start_time).toLocaleString()})
            <br />
            Offer my:
            <select value={offer[e.id] || ""} onChange={(ev) => setOffer({ ...offer, [e.id]: Number(ev.target.value) })}>
              <option value="">-- select slot --</option>
              {(myEvents as any[]).filter(m => m.status === "SWAPPABLE").map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
            <button onClick={() => requestSwap(e.id)}>Request Swap</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
