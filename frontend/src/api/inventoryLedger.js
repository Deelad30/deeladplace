import api from "./axios";

export const getLedger = async () => {
    return await api.get("/inventory/ledger");
};

export const getStockBalance = async () => {
    return await api.get("/inventory/balance");
};

export const recordMovement = async (data) => {
    // data: { item_id, item_type, movement_type, qty, source, destination, notes, date }
    return await api.post("/inventory/movement", data);
};
