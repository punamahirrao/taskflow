import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,g as n,h as r}from"./iframe-BQTBrSOw.js";import{n as i,t as a}from"./BoardForm-Dth2a3U4.js";var o,s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{r(),i(),{expect:o,fn:s,userEvent:c,within:l}=__STORYBOOK_MODULE_TEST__,u={name:``,description:``,project:String(n.id),type:`scrum`,members:[]},d=s(),f=e=>{e.preventDefault(),d(e)},p={title:`Boards/Features/CreateBoard`,component:a,tags:[`autodocs`],args:{projects:t,values:u,editing:null,busy:!1,error:``,onChange:s(),onSubmit:f,onCancel:s()},parameters:{docs:{description:{component:`Create or edit a project board. The form is presentation-only; the containing page owns validation, API requests, and submit state. Inputs have visible labels and support keyboard interaction.`}}}},m={},h={args:{error:`Enter a board name before saving.`}},g={args:{values:{...u,name:`Product Development`},busy:!0}},_={args:{values:{...u,name:`Product Development`}},play:async({canvasElement:e,args:t})=>{await c.click(l(e).getByRole(`button`,{name:/save/i})),await o(d).toHaveBeenCalledOnce()}},v=[`DialogOpen`,`ValidationError`,`Saving`,`SuccessfulSubmission`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    error: "Enter a board name before saving."
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    values: {
      ...initialValues,
      name: "Product Development"
    },
    busy: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    values: {
      ...initialValues,
      name: "Product Development"
    }
  },
  play: async ({
    canvasElement,
    args
  }) => {
    await userEvent.click(within(canvasElement).getByRole("button", {
      name: /save/i
    }));
    await expect(submitSpy).toHaveBeenCalledOnce();
  }
}`,..._.parameters?.docs?.source}}}})))()}y();export{m as DialogOpen,g as Saving,_ as SuccessfulSubmission,h as ValidationError,v as __namedExportsOrder,p as default};