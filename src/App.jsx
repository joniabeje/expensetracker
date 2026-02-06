import { useEffect, useState } from "react";

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

import outputs from "./amplify_outputs.json";

Amplify.configure(outputs);

const client = generateClient();


// Amplify.configure(outputs);
// const client = generateClient();

function App() {
  const [expenses, setExpenses] = useState([]);

  async function listExpenses() {
    const { data } = await client.models.Expense.list();
    setExpenses(data);
  }

  async function createExpense(event) {
    event.preventDefault();

    const form = new FormData(event.target);
    const name = form.get("name");
    const amount = Number(form.get("amount"));

    if (!name || Number.isNaN(amount)) return;

    await client.models.Expense.create({
      name,
      amount,
    });

    event.target.reset();
    await listExpenses();
  }

  async function deleteExpense(id) {
    await client.models.Expense.delete({ id });
    await listExpenses();
  }

  useEffect(() => {
    listExpenses();
  }, []);

  return (
    <Authenticator>
      {({ signOut }) => (
        <main style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
          <h1>ExpenseTracker</h1>

          <button onClick={signOut}>Sign out</button>

          <h2 style={{ marginTop: 24 }}>Create Expense</h2>

          <form onSubmit={createExpense} style={{ display: "grid", gap: 8 }}>
            <label>
              Name
              <input name="name" placeholder="Coffee" required />
            </label>

            <label>
              Amount
              <input
                name="amount"
                type="number"
                step="0.01"
                placeholder="4.50"
                required
              />
            </label>

            <button type="submit">Create</button>
          </form>

          <h2 style={{ marginTop: 24 }}>Expenses</h2>

          {expenses.length === 0 ? (
            <p>No expenses yet.</p>
          ) : (
            <ul>
              {expenses.map((expense) => (
                <li key={expense.id} style={{ marginBottom: 8 }}>
                  <strong>{expense.name}</strong> — ${expense.amount}
                  <button
                    style={{ marginLeft: 12 }}
                    onClick={() => deleteExpense(expense.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </main>
      )}
    </Authenticator>
  );
}

export default App;
