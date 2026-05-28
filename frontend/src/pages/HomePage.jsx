import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { VehicleCard } from "../components/VehicleCard";
import { LoadingState } from "../components/LoadingState";
import { listVehicles } from "../services/vehicleService";
import { brand } from "../assets/brand";

export function HomePage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listVehicles({ featured: true, limit: 3 })
      .then((result) => setVehicles(result.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero-section">
        <div className="hero-background" />
        <div className="hero-content">
          <p className="eyebrow">Volkswagen-inspired microservice platform</p>
          <h1>{brand.name}</h1>
          <p>{brand.tagline}</p>
          <div className="hero-actions">
            <Link className="primary-button" to="/vehicles">
              Explore vehicles
              <ArrowRight size={18} />
            </Link>
            <Link className="secondary-button" to="/register">
              Create account
            </Link>
          </div>
        </div>
      </section>

      <section className="feature-strip">
        <div>
          <Zap size={22} />
          <span>Electric-first catalog</span>
        </div>
        <div>
          <ShieldCheck size={22} />
          <span>JWT protected services</span>
        </div>
        <div>
          <Sparkles size={22} />
          <span>Premium dashboard UI</span>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Showcase</p>
          <h2>Featured motion lineup</h2>
        </div>
        {loading ? (
          <LoadingState label="Loading vehicles" />
        ) : (
          <div className="vehicle-grid">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
