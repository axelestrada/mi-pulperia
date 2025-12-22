import type { UIMatch } from "react-router-dom";
import type { RouteHandle } from "./types";

export function getRouteTitle(matches: UIMatch[]) {
  return (
    [...matches]
      .reverse()
      .find(
        (match): match is typeof match & { handle: RouteHandle } =>
          typeof match.handle === "object" &&
          match.handle !== null &&
          "title" in match.handle
      )?.handle.title
  );
}
