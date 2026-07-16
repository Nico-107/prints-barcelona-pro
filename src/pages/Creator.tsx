import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Creator = () => {
  return (
    <>
      <Helmet>
        <title>About the Builder | Dimension3D</title>
        <meta name="description" content="Mikołaj Szczełkun (Nico) built this platform solo — learn more about him and his other projects." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-secondary/20">
        <header className="border-b border-border bg-background">
          <div className="container px-4 h-14 flex items-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back
            </Link>
          </div>
        </header>

        <main className="container px-4 py-10 max-w-2xl">
          <h1 className="text-3xl font-bold mb-1">About the Builder</h1>

          <p className="text-muted-foreground leading-relaxed mt-4">
            This site was built solo by Mikołaj Szczełkun (Nico) — from the 3D print matching
            logic to the storefront and checkout. It's one of several products he's built and
            shipped independently. You can see more of his work at{" "}
            <a
              href="https://nico-portfolio-gold.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline"
            >
              nico-portfolio-gold.vercel.app
            </a>
            .
          </p>
        </main>
      </div>
    </>
  );
};

export default Creator;
