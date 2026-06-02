import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { useDisplayName } from "./hooks/useDisplayName";
import { generateRoomId, useRoomId } from "./hooks/useRoomId";
import { LoginPage } from "./pages/LoginPage";
import { RoomPage } from "./pages/RoomPage";

function RootRedirect() {
  const { roomId } = useRoomId();
  const targetId = roomId.length > 0 ? roomId : generateRoomId();
  return <Navigate to={`/room/${targetId}`} replace />;
}

function RoomRoute() {
  const { roomId } = useParams<{ roomId: string }>();
  const { displayName } = useDisplayName();

  if (!roomId) return <Navigate to="/" replace />;

  return displayName ? <RoomPage /> : <LoginPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/room/:roomId" element={<RoomRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
