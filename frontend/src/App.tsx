import { Navigate, Route, Routes } from "react-router-dom";
import { useDisplayName } from "./hooks/useDisplayName";
import { LoginPage } from "./pages/LoginPage";
import { RoomPage } from "./pages/RoomPage";

function RedirectIfMissingDisplayName() {
  const { displayName } = useDisplayName();
  return displayName ? <RoomPage /> : <Navigate to="/" replace />;
}

function RedirectIfDisplayNameExists() {
  const { displayName } = useDisplayName();
  return displayName ? <Navigate to="/room" replace /> : <LoginPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RedirectIfDisplayNameExists />} />
      <Route path="/room" element={<RedirectIfMissingDisplayName />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
