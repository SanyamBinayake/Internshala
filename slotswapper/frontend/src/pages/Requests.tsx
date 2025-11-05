import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";

export default function Requests() {
  const qc = useQueryClient();
  const { data = { incoming: [], outgoing: [] }, isLoading } = useQuery({
    queryKey: ["requests"],
    queryFn: async () => (await api.get("/swap/requests")).data,
    refetchInterval: 4000,
  });

  const respond = async (id: number, accept: boolean) => {
    await api.post(`/swap/swap-response/${id}`, { accept });
    qc.invalidateQueries({ queryKey: ["requests"] });
    qc.invalidateQueries({ queryKey: ["events"] });
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h3>Incoming Requests</h3>
      <ul>
        {data.incoming.map((r: any) => (
          <li key={r.id}>
            #{r.id} — {r.status}
            {r.status === "PENDING" && (
              <>
                <button onClick={() => respond(r.id, true)}>Accept</button>
                <button onClick={() => respond(r.id, false)}>Reject</button>
              </>
            )}
          </li>
        ))}
      </ul>

      <h3>Outgoing Requests</h3>
      <ul>
        {data.outgoing.map((r: any) => (
          <li key={r.id}>#{r.id} — {r.status}</li>
        ))}
      </ul>
    </div>
  );
}
