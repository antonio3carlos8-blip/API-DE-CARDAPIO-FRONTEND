import { Input } from "@/components/ui/input";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <Input
            type="search"
            placeholder="Buscar produtos..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white"
        />
    );
}
