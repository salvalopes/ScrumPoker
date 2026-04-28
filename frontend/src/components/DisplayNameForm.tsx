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

export function DisplayNameForm({
  initialValue = "",
  onSubmit
}: DisplayNameFormProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedValue = normalizeDisplayName(value);

    if (!isValidDisplayName(trimmedValue)) {
      return;
    }

    onSubmit(trimmedValue);
  };

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="form-copy">
        <p className="eyebrow">Single room</p>
        <h1>Join the Scrum Poker table</h1>
        <p>
          Pick the display name that everyone in the room will see. We will keep
          it in a cookie so you can jump straight back in next time.
        </p>
      </div>

      <label className="field">
        <span>Display name</span>
        <input
          autoFocus
          maxLength={displayNameConfig.maxLength}
          placeholder="e.g. Salvador"
          value={value}
          onChange={(event) => setValue(normalizeDisplayName(event.target.value))}
        />
      </label>

      <button className="primary-button" type="submit">
        Enter room
      </button>
    </form>
  );
}
