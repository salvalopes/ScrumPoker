import { useNavigate } from "react-router-dom";
import { DisplayNameForm } from "../components/DisplayNameForm";
import { useDisplayName } from "../hooks/useDisplayName";

export function LoginPage() {
  const navigate = useNavigate();
  const { setDisplayName } = useDisplayName();

  const handleSubmit = (displayName: string) => {
    const didSetDisplayName = setDisplayName(displayName);

    if (didSetDisplayName) {
      navigate("/room", { replace: true });
    }
  };

  return (
    <main className="screen login-screen">
      <DisplayNameForm onSubmit={handleSubmit} />
    </main>
  );
}
