import UnavailableProjectLinkPage from "@@/components/ui/UnavailableProjectLinkPage";

type RawSearchParams = Record<string, string | string[] | undefined>;

type UnavailablePageProps = {
  searchParams?: RawSearchParams | Promise<RawSearchParams>;
};

const firstValue = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
};

export default async function UnavailablePage({
  searchParams,
}: UnavailablePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const projectName = firstValue(params?.project).trim() || "this project";
  const rawType = firstValue(params?.type).toLowerCase() || "code";
  const clickType = rawType === "demo" ? "demo" : "code";

  return (
    <UnavailableProjectLinkPage
      projectName={projectName}
      clickType={clickType}
    />
  );
}
