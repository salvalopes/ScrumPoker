import { useNavigate, useParams } from "react-router-dom";
import { DisplayNameForm } from "../components/DisplayNameForm";
import { useDisplayName } from "../hooks/useDisplayName";

export function LoginPage() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { setDisplayName } = useDisplayName();

  const handleSubmit = (displayName: string) => {
    const didSetDisplayName = setDisplayName(displayName);
    if (didSetDisplayName) {
      navigate(`/room/${roomId}`, { replace: true });
    }
  };

  return (
    <div className="login-screen">
      <DisplayNameForm onSubmit={handleSubmit} />
    </div>
  );
}
