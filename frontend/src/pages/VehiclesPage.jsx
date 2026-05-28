import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { VehicleCard } from "../components/VehicleCard";
import { useAuth } from "../hooks/useAuth";
import { getCategories, listVehicles } from "../services/vehicleService";
import { getSavedVehicles, saveVehicle } from "../services/profileService";

export function VehiclesPage() {
  const { isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", category: "", sortBy: "price", sortDirection: "asc", page: 1 });

  const savedIds = useMemo(() => new Set(savedVehicles.map((item) => item.vehicleId)), [savedVehicles]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    listVehicles({ ...filters, limit: 6 })
      .then((result) => {
        setVehicles(result.data);
        setPagination(result.pagination);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    if (isAuthenticated) {
      getSavedVehicles().then(setSavedVehicles).catch(() => setSavedVehicles([]));
    }
  }, [isAuthenticated]);

  function updateFilter(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value, page: 1 }));
  }

  async function handleSave(vehicle) {
    if (!isAuthenticated) {
      return;
    }
    const saved = await saveVehicle({ vehicleId: vehicle.id, notes: vehicle.name });
    setSavedVehicles((current) => {
      const withoutDuplicate = current.filter((item) => item.vehicleId !== saved.vehicleId);
      return [saved, ...withoutDuplicate];
    });
  }

  return (
    <section className="section-block page-top">
      <div className="section-heading split-heading">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Vehicle lineup</h1>
        </div>
        <div className="search-shell">
          <Search size={18} />
          <input name="search" placeholder="Search vehicles" value={filters.search} onChange={updateFilter} />
        </div>
      </div>

      <div className="filter-bar">
        <select name="category" value={filters.category} onChange={updateFilter}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select name="sortBy" value={filters.sortBy} onChange={updateFilter}>
          <option value="price">Price</option>
          <option value="horsepower">Horsepower</option>
          <option value="name">Name</option>
          <option value="createdAt">Newest</option>
        </select>
        <select name="sortDirection" value={filters.sortDirection} onChange={updateFilter}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {loading ? (
        <LoadingState label="Loading catalog" />
      ) : vehicles.length === 0 ? (
        <EmptyState title="No vehicles found" message="Adjust the filters to broaden the showroom." />
      ) : (
        <>
          <div className="vehicle-grid">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onSave={isAuthenticated ? handleSave : null}
                saved={savedIds.has(vehicle.id)}
              />
            ))}
          </div>
          <div className="pagination-row">
            <button
              className="secondary-button"
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.pages || 1}
            </span>
            <button
              className="secondary-button"
              type="button"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}
