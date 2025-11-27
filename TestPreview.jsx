import { useState } from "react";
import OptionInput from "./components/CreatePoll/OptionInput";
import Card from "./components/Common/card";
import Button from "./components/Common/button";
import Loader from "./components/Common/loader";

export default function TestPreview() {
  // Initialize options as objects with stable ids
  const [options, setOptions] = useState([
    { id: 1, value: "" },
    { id: 2, value: "" },
  ]);

  // helper to generate a simple unique id
  const nextId = () => Date.now() + Math.floor(Math.random() * 1000);

  // update option by id
  const updateOption = (id, value) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, value } : o)));
  };

  // remove option by id but keep at least 2 options
  const removeOption = (id) => {
    setOptions((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((o) => o.id !== id);
    });
  };

  // add a new empty option
  const addOption = () => {
    setOptions((prev) => [...prev, { id: nextId(), value: "" }]);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Component Preview</h1>

      <Card>
        <h2 className="text-lg mb-3 font-semibold">Option Inputs</h2>
        {options.map((opt, i) => (
          <OptionInput
            key={opt.id}
            value={opt.value}
            index={i}
            onChange={(val) => updateOption(opt.id, val)}
            onRemove={() => removeOption(opt.id)}
            allowRemove={options.length > 2}
          />
        ))}

        <div className="mt-4 flex flex-col gap-3">
          <Button onClick={addOption}>Add Option</Button>
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg mb-3 font-semibold">Loader Preview</h2>
        <Loader size={28} />
      </Card>
    </div>
  );
}
