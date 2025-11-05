import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import EventForm from "../components/EventForm";

export default function Dashboard() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => (await api.get("/events")).data,
  });

  const createEvent = async (payload: any) => {
    await api.post("/events", payload);
    qc.invalidateQueries({ queryKey: ["events"] });
  };

  const makeSwappable = async (id: number) => {
    const ev = (data as any[]).find(x => x.id === id);
    await api.put(`/events/${id}`, { ...ev, status: "SWAPPABLE" });
    qc.invalidateQueries({ queryKey: ["events"] });
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h3>My Events</h3>
      <EventForm onSubmit={createEvent} />
      <ul>
        {(data as any[]).map(e => (
          <li key={e.id}>
            <b>{e.title}</b> — {e.status}
            {e.status === "BUSY" && <button onClick={() => makeSwappable(e.id)}>Make Swappable</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}
