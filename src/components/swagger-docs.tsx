"use client";

import * as React from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export function SwaggerDocs() {
  const [spec, setSpec] = React.useState<unknown>(null);

  React.useEffect(() => {
    fetch("/api/openapi")
      .then((res) => res.json())
      .then(setSpec);
  }, []);

  if (!spec) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-slate-400">
        Loading OpenAPI specification…
      </div>
    );
  }

  return <SwaggerUI spec={spec as never} docExpansion="list" persistAuthorization />;
}
