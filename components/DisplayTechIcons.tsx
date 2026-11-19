import Image from "next/image";
import { cn, getTechLogos } from "@/lib/utils";

const DisplayTechIcons = async ({ techStack }: TechIconProps) => {
  const techIcons = await getTechLogos(techStack || []);

  if (!techIcons || techIcons.length === 0) return null;

  return (
    <div className="flex items-center -space-x-1.5 overflow-hidden">
      {techIcons.slice(0, 4).map(({ tech, url }) => (
        <div
          key={tech}
          className="relative group flex items-center justify-center size-7 rounded-md bg-slate-800 border border-slate-700/80 p-1 shadow-xs transition-transform hover:scale-110 hover:z-10"
        >
          {/* Tooltip */}
          <span className="absolute bottom-full mb-1.5 hidden group-hover:flex items-center px-2 py-0.5 text-[10px] font-medium text-slate-100 bg-slate-900 border border-slate-700 rounded shadow-md whitespace-nowrap z-20 pointer-events-none">
            {tech}
          </span>

          <Image
            src={url}
            alt={tech}
            width={20}
            height={20}
            className="size-4 object-contain"
          />
        </div>
      ))}
      {techIcons.length > 4 && (
        <span className="flex items-center justify-center size-7 rounded-md bg-slate-800/80 border border-slate-700/80 text-[10px] font-medium text-slate-400 pl-0.5">
          +{techIcons.length - 4}
        </span>
      )}
    </div>
  );
};

export default DisplayTechIcons;
