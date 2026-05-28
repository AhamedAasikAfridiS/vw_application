import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="section-block page-top not-found">
      <p className="eyebrow">404</p>
      <h1>Route not found</h1>
      <p>The page you requested is not part of this showroom.</p>
      <Link className="primary-button" to="/">
        Return home
      </Link>
    </section>
  );
}
