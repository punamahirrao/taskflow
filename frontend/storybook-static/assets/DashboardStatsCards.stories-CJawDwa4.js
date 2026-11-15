import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./DashboardStatsCards-DMgKP_Go.js";var r,i,a,o,s,c;function l(){return(l=e((()=>{t(),r={title:`Dashboard/Components/DashboardStatsCards`,component:n,tags:[`autodocs`],parameters:{docs:{description:{component:`Responsive summary cards for project and task health. Loading cards announce their busy state and keep the same layout to reduce visual shift.`}}}},i={args:{stats:{totalProjects:2,completedTasks:38,pendingTasks:27,completionRate:58},loading:!1}},a={args:{stats:null,loading:!0}},o={args:{stats:{totalProjects:0,completedTasks:0,pendingTasks:0,completionRate:0},loading:!1}},s={...i,globals:{theme:`night`}},c=[`Default`,`Loading`,`Empty`,`DarkMode`],i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    stats: {
      totalProjects: 2,
      completedTasks: 38,
      pendingTasks: 27,
      completionRate: 58
    },
    loading: false
  }
}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    stats: null,
    loading: true
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    stats: {
      totalProjects: 0,
      completedTasks: 0,
      pendingTasks: 0,
      completionRate: 0
    },
    loading: false
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  ...Default,
  globals: {
    theme: "night"
  }
}`,...s.parameters?.docs?.source}}}})))()}l();export{s as DarkMode,i as Default,o as Empty,a as Loading,c as __namedExportsOrder,r as default};