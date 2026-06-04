export const supportsViewTransitions = () => {
  return "startViewTransition" in document;
};

export const transitionHelper = (updateCallback: () => void | Promise<void>) => {
  if (!supportsViewTransitions()) {
    updateCallback();
    return;
  }

  (document as any).startViewTransition(async () => {
    await updateCallback();
  });
};
