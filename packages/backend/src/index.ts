import type { DefineAPI, DefineEvents, SDK } from "caido:plugin";

export type BackendEvents = DefineEvents<{
  "chatio:projectChange": (projectId: string | undefined) => void;
}>;

const debugConnection = (
  _sdk: SDK,
): { status: string; timestamp: string; backendActive: boolean } => {
  return {
    status: "Backend connected successfully",
    timestamp: new Date().toISOString(),
    backendActive: true,
  };
};

const getCurrentProjectId = async (sdk: SDK): Promise<string | undefined> => {
  const project = await sdk.projects.getCurrent();
  return project?.getId() ?? undefined;
};

const getCurrentProject = async (
  sdk: SDK,
): Promise<{ id: string | undefined; name: string }> => {
  const project = await sdk.projects.getCurrent();
  if (project !== undefined) {
    return { id: project.getId(), name: project.getName() ?? project.getId() };
  }
  return { id: undefined, name: "Global" };
};

export type API = DefineAPI<{
  debugConnection: typeof debugConnection;
  getCurrentProjectId: typeof getCurrentProjectId;
  getCurrentProject: typeof getCurrentProject;
}>;

export function init(sdk: SDK<API, BackendEvents>) {
  sdk.api.register("debugConnection", debugConnection);
  sdk.api.register("getCurrentProjectId", getCurrentProjectId);
  sdk.api.register("getCurrentProject", getCurrentProject);

  sdk.events.onProjectChange((sdk, project) => {
    const projectId = project?.getId() ?? undefined;
    sdk.api.send("chatio:projectChange", projectId);
  });
}
