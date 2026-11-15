import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./BoardCard-DlZ-Eb2g.js";import{O as r,f as i,g as a,h as o,p as s}from"./iframe-BQTBrSOw.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{t(),i(),o(),c=r(),{expect:l,fn:u,userEvent:d,within:f}=__STORYBOOK_MODULE_TEST__,p={title:`Boards/Components/BoardCard`,component:n,tags:[`autodocs`],args:{board:s,project:a,canManage:!0,menuOpen:!1,onOpen:u(),onMenu:u(),onEdit:u(),onArchive:u(),onProjectSettings:u()},parameters:{docs:{description:{component:`A project board summary card with board metrics, collaborators, and management actions. Keyboard users can activate the board and actions with standard buttons.`}}}},m={},h={render:()=>(0,c.jsx)(`div`,{role:`status`,"aria-label":`Loading boards`,className:`h-64 animate-pulse rounded-2xl border border-line bg-subtle`})},g={args:{board:{...s,task_count:0,sprint_count:0,member_count:0,members:[],description:``}}},_={render:()=>(0,c.jsx)(`p`,{role:`alert`,className:`rounded-xl border border-danger/20 bg-danger-soft p-4 text-danger`,children:`Boards could not be loaded. Try again.`})},v={args:{board:{...s,name:`Customer Platform Modernization and Global Identity Management`,description:`A cross-functional initiative spanning account recovery, customer identity, accessibility, compliance, analytics, and the global onboarding experience.`},project:{...a,name:`Atlas Customer Experience Modernization`}}},y={globals:{theme:`night`}},b={args:{menuOpen:!0}},x={play:async({canvasElement:e,args:t})=>{await d.click(f(e).getAllByRole(`button`)[0]),await l(t.onOpen).toHaveBeenCalledOnce()}},S=[`Default`,`Loading`,`Empty`,`Error`,`LongContent`,`DarkMode`,`OpenManagementMenu`,`OpenBoardInteraction`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div role="status" aria-label="Loading boards" className="h-64 animate-pulse rounded-2xl border border-line bg-subtle" />
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    board: {
      ...mockBoard,
      task_count: 0,
      sprint_count: 0,
      member_count: 0,
      members: [],
      description: ""
    }
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <p role="alert" className="rounded-xl border border-danger/20 bg-danger-soft p-4 text-danger">Boards could not be loaded. Try again.</p>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    board: {
      ...mockBoard,
      name: "Customer Platform Modernization and Global Identity Management",
      description: "A cross-functional initiative spanning account recovery, customer identity, accessibility, compliance, analytics, and the global onboarding experience."
    },
    project: {
      ...mockProject,
      name: "Atlas Customer Experience Modernization"
    }
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  globals: {
    theme: "night"
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    menuOpen: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    await userEvent.click(within(canvasElement).getAllByRole("button")[0]);
    await expect(args.onOpen).toHaveBeenCalledOnce();
  }
}`,...x.parameters?.docs?.source}}}})))()}C();export{y as DarkMode,m as Default,g as Empty,_ as Error,h as Loading,v as LongContent,x as OpenBoardInteraction,b as OpenManagementMenu,S as __namedExportsOrder,p as default};