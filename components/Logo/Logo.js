import { faBurst } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Logo = () => {
  return <div className="text-5xl text-center py-4 font-heading font-bold text-blue-300">
    BlogBuster
    <FontAwesomeIcon icon={faBurst} className="text-4xl text-gray-200" />
  </div>;
};