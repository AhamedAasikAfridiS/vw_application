import { ArrowRight, BatteryCharging, Gauge, Heart, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function VehicleCard({ vehicle, onSave, saved = false }) {
  return (
    <article className="vehicle-card">
      <div className="vehicle-card-media">
        <img src={vehicle.imageUrl} alt={vehicle.name} loading="lazy" />
        <span className="vehicle-badge">{vehicle.category}</span>
      </div>
      <div className="vehicle-card-body">
        <div>
          <p className="eyebrow">{vehicle.drivetrain}</p>
          <h3>{vehicle.name}</h3>
          <p>{vehicle.tagline}</p>
        </div>
        <div className="vehicle-metrics">
          <span>
            <Zap size={15} />
            {vehicle.horsepower} hp
          </span>
          <span>
            <Gauge size={15} />
            {vehicle.acceleration}
          </span>
          {vehicle.rangeKm && (
            <span>
              <BatteryCharging size={15} />
              {vehicle.rangeKm} km
            </span>
          )}
        </div>
        <div className="vehicle-card-footer">
          <strong>${Number(vehicle.price).toLocaleString()}</strong>
          <div className="card-actions">
            {onSave && (
              <button className={`icon-button ${saved ? "active" : ""}`} type="button" onClick={() => onSave(vehicle)}>
                <Heart size={18} fill={saved ? "currentColor" : "none"} />
              </button>
            )}
            <Link className="icon-text-button" to={`/vehicles/${vehicle.id}`}>
              Details
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
