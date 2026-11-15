import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./WorkItemCard-DMGmROdr.js";import{c as r,o as i,s as a}from"./iframe-BQTBrSOw.js";var o,s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{i(),t(),{expect:o,fn:s,userEvent:c,within:l}=__STORYBOOK_MODULE_TEST__,u={title:`Agile/Components/WorkItemCard`,component:n,tags:[`autodocs`],args:{task:a,candidates:r,onEdit:s(),onAssign:s(),onEscalate:s()},parameters:{docs:{description:{component:`A compact, keyboard-accessible agile task card with priority, estimate, status, assignment, and sprint actions.`}}}},d={},f={args:{compact:!0}},p={args:{task:{...a,blocked:!0,blocked_by:[402]}}},m={args:{task:{...a,assignee:null,assignee_name:``,sprint:null,sprint_name:null},sprintAction:`plan`}},h={args:{task:{...a,title:`Coordinate customer identity migration across regional platform services`,description:`Plan a phased migration with security review, customer communication, observability, and rollback coverage.`}}},g={...d,globals:{theme:`night`}},_={play:async({canvasElement:e,args:t})=>{await c.click(l(e).getByRole(`article`,{name:/task card: create release readiness checklist/i})),await o(t.onEdit).toHaveBeenCalledOnce()}},v=[`Default`,`Compact`,`Blocked`,`Unassigned`,`LongContent`,`DarkMode`,`EditInteraction`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    compact: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    task: {
      ...mockTask,
      blocked: true,
      blocked_by: [402]
    }
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    task: {
      ...mockTask,
      assignee: null,
      assignee_name: "",
      sprint: null,
      sprint_name: null
    },
    sprintAction: "plan"
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    task: {
      ...mockTask,
      title: "Coordinate customer identity migration across regional platform services",
      description: "Plan a phased migration with security review, customer communication, observability, and rollback coverage."
    }
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  ...Default,
  globals: {
    theme: "night"
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    await userEvent.click(within(canvasElement).getByRole("article", {
      name: /task card: create release readiness checklist/i
    }));
    await expect(args.onEdit).toHaveBeenCalledOnce();
  }
}`,..._.parameters?.docs?.source}}}})))()}y();export{p as Blocked,f as Compact,g as DarkMode,d as Default,_ as EditInteraction,h as LongContent,m as Unassigned,v as __namedExportsOrder,u as default};