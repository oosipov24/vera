export async function mockDelay(ms = 250): Promise<void> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
