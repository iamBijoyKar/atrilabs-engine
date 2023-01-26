import { useContext } from "react";
import { AtriScriptsContext } from "../contexts/AtriScriptsContext";

export default function AtriScripts() {
  const { pages } = useContext(AtriScriptsContext);
  const Scripts = pages.map((page) => {
    return <script src={page}></script>;
  });
  return <>{Scripts}</>;
}
