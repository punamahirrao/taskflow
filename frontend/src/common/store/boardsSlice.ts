import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAccessibleAgileBoards } from "../../project-detail/api/tasks";
import type { AgileBoard } from "../entities/task";

interface BoardsPayload { active: AgileBoard[]; archived: AgileBoard[] }
interface BoardsState extends BoardsPayload { loading: boolean; error: string }
const initialState: BoardsState = { active: [], archived: [], loading: true, error: "" };
export const loadAccessibleBoards = createAsyncThunk<BoardsPayload, void, { rejectValue: string }>("boards/load", async (_, { rejectWithValue }) => {
  try { const [active, archived] = await Promise.all([getAccessibleAgileBoards(), getAccessibleAgileBoards(true)]); return { active, archived }; }
  catch (error) { return rejectWithValue(error instanceof Error ? error.message : "Unable to load boards."); }
});
const boardsSlice = createSlice({ name: "boards", initialState, reducers: { boardsCleared: () => initialState }, extraReducers: (builder) => builder
  .addCase(loadAccessibleBoards.pending, (state) => { state.loading = true; state.error = ""; })
  .addCase(loadAccessibleBoards.fulfilled, (state, action) => { state.loading = false; state.active = action.payload.active; state.archived = action.payload.archived; })
  .addCase(loadAccessibleBoards.rejected, (state, action) => { state.loading = false; state.error = action.payload ?? action.error.message ?? "Unable to load boards."; }) });
export const boardActions = boardsSlice.actions;
export default boardsSlice.reducer;
