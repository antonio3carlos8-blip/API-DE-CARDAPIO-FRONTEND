import { describe, it, expect } from "vitest";
import { reducer, actionTypes } from "@/app/hooks/use-toast";

describe("use-toast reducer", () => {
  it("adds toast to state", () => {
    const initialState = { toasts: [] };
    const newToast = { id: "1", title: "Sucesso!", description: "Operação realizada." };

    const state = reducer(initialState, {
      type: actionTypes.ADD_TOAST,
      toast: newToast,
    });

    expect(state.toasts.length).toBe(1);
    expect(state.toasts[0].id).toBe("1");
    expect(state.toasts[0].title).toBe("Sucesso!");
  });

  it("updates existing toast", () => {
    const initialState = {
      toasts: [{ id: "1", title: "Inicial" }],
    };

    const state = reducer(initialState, {
      type: actionTypes.UPDATE_TOAST,
      toast: { id: "1", title: "Atualizado" },
    });

    expect(state.toasts[0].title).toBe("Atualizado");
  });

  it("removes toast from state", () => {
    const initialState = {
      toasts: [{ id: "1", title: "Para remover" }],
    };

    const state = reducer(initialState, {
      type: actionTypes.REMOVE_TOAST,
      toastId: "1",
    });

    expect(state.toasts.length).toBe(0);
  });
});
