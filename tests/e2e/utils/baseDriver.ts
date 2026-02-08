// TODO: create utils for testing (examples below)

// The Default Choice (Main use case)
// Works in Unit and E2E tests.
// - Use semanticInteractor

// 2 - If you need to test something without semantic or expected text
// - Use htmlInteractor

// 3 - If you need
// Browser Control - change Network, take screenshot, open new tab, .etc
// Native OS Events - Drag-and-Drop, FileUpload
// Native user behavior - with hovers, cursor moving .etc
// - Use pure playwrightDriver (Chrome DevTools Protocol)
