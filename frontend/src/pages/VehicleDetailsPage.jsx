import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BatteryCharging, Gauge, Heart, ShieldCheck, Zap } from "lucide-react";
import { LoadingState } from "../components/LoadingState";
import { useAuth } from "../hooks/useAuth";
import { getVehicle } from "../services/vehicleService";
import { saveVehicle } from "../services/profileService";

export function VehicleDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getVehicle(id)
      .then(setVehicle)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    await saveVehicle({ vehicleId: vehicle.id, notes: vehicle.name });
    setSaved(true);
  }

  if (loading) {
    return <LoadingState label="Loading vehicle" />;
  }

  if (!vehicle) {
    return (
      <section className="section-block page-top">
        <h1>Vehicle not found</h1>
        <Link className="secondary-button" to="/vehicles">
          Back to vehicles
        </Link>
      </section>
    );
  }

  return (
    <section className="details-page">
      <div className="details-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,8,10,.92), rgba(7,8,10,.28)), url(${vehicle.imageUrl})` }}>
        <div className="details-content">
          <Link className="text-link" to="/vehicles">
            <ArrowLeft size={16} />
            Vehicles
          </Link>
          <p className="eyebrow">{vehicle.category}</p>
          <h1>{vehicle.name}</h1>
          <p>{vehicle.description}</p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <button className="primary-button" type="button" onClick={handleSave}>
                <Heart size={18} fill={saved ? "currentColor" : "none"} />
                {saved ? "Saved" : "Save vehicle"}
              </button>
            ) : (
              <Link className="primary-button" to="/login">
                Login to save
              </Link>
            )}
            <span className="price-lockup">${Number(vehicle.price).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="details-metrics">
        <span>
          <Zap size={18} />
          {vehicle.horsepower} hp
        </span>
        <span>
          <Gauge size={18} />
          {vehicle.acceleration}
        </span>
        <span>
          <ShieldCheck size={18} />
          {vehicle.drivetrain}
        </span>
        {vehicle.rangeKm && (
          <span>
            <BatteryCharging size={18} />
            {vehicle.rangeKm} km range
          </span>
        )}
      </div>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Specifications</p>
          <h2>Engineering profile</h2>
        </div>
        <div className="spec-grid">
          {Object.entries(vehicle.specs || {}).map(([key, value]) => (
            <div className="spec-item" key={key}>
              <span>{key}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
