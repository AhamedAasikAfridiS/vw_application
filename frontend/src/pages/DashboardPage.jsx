import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Car, Heart, UserRound } from "lucide-react";
import { LoadingState } from "../components/LoadingState";
import { StatCard } from "../components/StatCard";
import { VehicleCard } from "../components/VehicleCard";
import { useAuth } from "../hooks/useAuth";
import { getProfile, getSavedVehicles } from "../services/profileService";
import { listVehicles } from "../services/vehicleService";

export function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProfile(),
      getSavedVehicles(),
      listVehicles({ featured: true, limit: 3 })
    ])
      .then(([profileResult, savedResult, vehicleResult]) => {
        setProfile(profileResult);
        setSavedVehicles(savedResult);
        setFeaturedVehicles(vehicleResult.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const savedVehicleText = useMemo(
    () => `${savedVehicles.length} saved`,
    [savedVehicles.length]
  );

  if (loading) {
    return <LoadingState label="Loading dashboard" />;
  }

  return (
    <section className="section-block page-top">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Cockpit</p>
          <h1>Hello, {profile?.displayName || user?.name}</h1>
          <p>Review your profile, saved vehicles, and featured recommendations from one command center.</p>
        </div>
        <Link className="primary-button" to="/vehicles">
          Browse lineup
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="stat-grid">
        <StatCard label="Account role" value={user?.role || "user"} accent="yellow" />
        <StatCard label="Saved vehicles" value={savedVehicleText} accent="red" />
        <StatCard label="Featured models" value={featuredVehicles.length} accent="white" />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <UserRound size={20} />
            <h2>Profile snapshot</h2>
          </div>
          <p>{profile?.email}</p>
          <p>{profile?.location || "Location not set"}</p>
          <Link className="icon-text-button" to="/profile">
            Manage profile
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <Heart size={20} />
            <h2>Saved vehicles</h2>
          </div>
          <p>{savedVehicles.length ? "Your saved showroom is ready." : "Start saving vehicles from the catalog."}</p>
          <Link className="icon-text-button" to="/vehicles">
            Open catalog
            <Car size={16} />
          </Link>
        </div>
      </div>

      <div className="section-heading">
        <p className="eyebrow">Recommended</p>
        <h2>Featured vehicles</h2>
      </div>
      <div className="vehicle-grid">
        {featuredVehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </section>
  );
}
