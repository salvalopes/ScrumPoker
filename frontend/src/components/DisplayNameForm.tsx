import { FormEvent, useState } from "react";
import {
  displayNameConfig,
  isValidDisplayName,
  normalizeDisplayName
} from "../config/displayName";

type DisplayNameFormProps = {
  initialValue?: string;
  onSubmit: (displayName: string) => void;
};

export function DisplayNameForm({ initialValue = "", onSubmit }: DisplayNameFormProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedValue = normalizeDisplayName(value);
    if (!isValidDisplayName(trimmedValue)) return;
    onSubmit(trimmedValue);
  };

  return (
    <form className="login-card" onSubmit={handleSubmit}>
      <p className="login-eyebrow">Single room · Scrum Poker</p>
      <h1>Take a seat at the table.</h1>
      <p>
        Pick the name your team will see. We'll keep it on this device so you
        don't have to type it again.
      </p>

      <label className="login-field">
        <span>Display name</span>
        <input
          autoFocus
          maxLength={displayNameConfig.maxLength}
          placeholder="e.g. Salvador"
          value={value}
          onChange={(event) => setValue(normalizeDisplayName(event.target.value))}
        />
      </label>

      <div className="login-actions">
        <button className="btn primary" type="submit">
          Enter room →
        </button>
      </div>
    </form>
  );
}
