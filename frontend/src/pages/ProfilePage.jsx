import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { LoadingState } from "../components/LoadingState";
import {
  getPreferences,
  getProfile,
  getSavedVehicles,
  removeSavedVehicle,
  updatePreferences,
  updateProfile
} from "../services/profileService";

export function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([getProfile(), getPreferences(), getSavedVehicles()])
      .then(([profileResult, preferencesResult, savedResult]) => {
        setProfile(profileResult);
        setPreferences(preferencesResult);
        setSavedVehicles(savedResult);
      })
      .finally(() => setLoading(false));
  }, []);

  function updateProfileField(event) {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function updatePreferenceField(event) {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setPreferences((current) => ({ ...current, [event.target.name]: value }));
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    const result = await updateProfile(profile);
    setProfile(result);
    setMessage("Profile saved.");
  }

  async function handlePreferencesSubmit(event) {
    event.preventDefault();
    const result = await updatePreferences({
      ...preferences,
      budgetMin: preferences.budgetMin || null,
      budgetMax: preferences.budgetMax || null
    });
    setPreferences(result);
    setMessage("Preferences saved.");
  }

  async function handleRemoveSaved(vehicleId) {
    await removeSavedVehicle(vehicleId);
    setSavedVehicles((current) => current.filter((vehicle) => vehicle.vehicleId !== vehicleId));
  }

  if (loading) {
    return <LoadingState label="Loading profile" />;
  }

  return (
    <section className="section-block page-top">
      <div className="section-heading">
        <p className="eyebrow">Driver profile</p>
        <h1>Account preferences</h1>
      </div>

      {message && <p className="success-message">{message}</p>}

      <div className="profile-grid">
        <form className="panel form-stack" onSubmit={handleProfileSubmit}>
          <h2>Profile</h2>
          <label>
            Display name
            <input name="displayName" value={profile.displayName || ""} onChange={updateProfileField} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={profile.email || ""} onChange={updateProfileField} required />
          </label>
          <label>
            Phone
            <input name="phone" value={profile.phone || ""} onChange={updateProfileField} />
          </label>
          <label>
            Location
            <input name="location" value={profile.location || ""} onChange={updateProfileField} />
          </label>
          <button className="primary-button" type="submit">
            <Save size={18} />
            Save profile
          </button>
        </form>

        <form className="panel form-stack" onSubmit={handlePreferencesSubmit}>
          <h2>Preferences</h2>
          <label>
            Minimum budget
            <input name="budgetMin" type="number" value={preferences.budgetMin || ""} onChange={updatePreferenceField} />
          </label>
          <label>
            Maximum budget
            <input name="budgetMax" type="number" value={preferences.budgetMax || ""} onChange={updatePreferenceField} />
          </label>
          <label>
            Favorite category
            <input name="favoriteCategory" value={preferences.favoriteCategory || ""} onChange={updatePreferenceField} />
          </label>
          <label>
            Preferred drivetrain
            <input name="preferredDrivetrain" value={preferences.preferredDrivetrain || ""} onChange={updatePreferenceField} />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              name="newsletterOptIn"
              checked={Boolean(preferences.newsletterOptIn)}
              onChange={updatePreferenceField}
            />
            Receive product updates
          </label>
          <button className="primary-button" type="submit">
            <Save size={18} />
            Save preferences
          </button>
        </form>
      </div>

      <div className="panel saved-panel">
        <h2>Saved vehicles</h2>
        {savedVehicles.length === 0 ? (
          <p>No vehicles saved yet.</p>
        ) : (
          <div className="saved-list">
            {savedVehicles.map((vehicle) => (
              <div key={vehicle.vehicleId} className="saved-row">
                <span>{vehicle.notes || vehicle.vehicleId}</span>
                <button className="secondary-button" type="button" onClick={() => handleRemoveSaved(vehicle.vehicleId)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
