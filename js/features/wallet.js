(function (global) {
  "use strict";

  var state = Object.freeze({ available: 0, pending: 0, transactions: [] });
  var listeners = [];

  function apiBase() {
    return typeof HU_API !== "undefined" ? HU_API : "";
  }

  function finiteBalance(value, name) {
    var number = Number(value);
    if (!Number.isFinite(number) || number < 0) {
      throw new Error("Invalid confirmed " + name + " balance");
    }
    return number;
  }

  function normalize(payload) {
    if (!payload || typeof payload !== "object") throw new Error("Invalid wallet response");
    var rawAvailable = payload.available_balance;
    if (rawAvailable === undefined) rawAvailable = payload.hu_coins_balance;
    if (rawAvailable === undefined) rawAvailable = payload.balance;
    if (rawAvailable === undefined) throw new Error("Wallet response has no confirmed balance");
    var history = payload.transactions || payload.ledger || [];
    if (!Array.isArray(history)) throw new Error("Invalid wallet history");
    return {
      available: finiteBalance(rawAvailable, "available"),
      pending: finiteBalance(payload.pending_balance === undefined ? 0 : payload.pending_balance, "pending"),
      transactions: history.slice(),
    };
  }

  function render() {
    ["sidebar-hu-coins", "rp-coins", "wallet-coins", "rev-coins"].forEach(function (id) {
      var element = document.getElementById(id);
      if (element) element.textContent = state.available.toLocaleString();
    });
    document.querySelectorAll("[data-wallet-available]").forEach(function (element) {
      element.textContent = state.available.toLocaleString();
    });
    document.querySelectorAll("[data-wallet-pending]").forEach(function (element) {
      element.textContent = state.pending.toLocaleString();
    });
    listeners.forEach(function (listener) { listener(state); });
  }

  function commit(payload) {
    var confirmed = normalize(payload);
    state = Object.freeze({
      available: confirmed.available,
      pending: confirmed.pending,
      transactions: Object.freeze(confirmed.transactions),
    });
    render();
    return state;
  }

  async function fetchWallet(path) {
    var token = localStorage.getItem("hu_token");
    var response = await fetch(apiBase() + path, {
      headers: token ? { Authorization: "Bearer " + token } : {},
    });
    if (!response.ok) throw new Error("Wallet request failed with " + response.status);
    return commit(await response.json());
  }

  function refreshSummary() {
    return fetchWallet("/api/rewards/summary");
  }

  function refreshHistory() {
    return fetchWallet("/api/wallet/ledger");
  }

  function acceptServerResult(payload) {
    if (!payload || payload.new_hu_coins === undefined) {
      throw new Error("Server result has no confirmed wallet balance");
    }
    return commit({
      available_balance: payload.new_hu_coins,
      pending_balance: 0,
      transactions: state.transactions,
    });
  }

  function subscribe(listener) {
    if (typeof listener !== "function") throw new TypeError("Wallet listener must be a function");
    listeners.push(listener);
    return function () { listeners = listeners.filter(function (item) { return item !== listener; }); };
  }

  global.JornizWallet = Object.freeze({
    getState: function () { return state; },
    refreshSummary: refreshSummary,
    refreshHistory: refreshHistory,
    acceptServerResult: acceptServerResult,
    subscribe: subscribe,
  });
})(window);
