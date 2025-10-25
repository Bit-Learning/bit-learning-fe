import { BsSelect } from '@workspace/ui/components/Select'

const languages = [
    { id: 1, name: 'English' },
    { id: 2, name: 'Spanish' },
    { id: 3, name: 'French' },
    { id: 4, name: 'German' },
    { id: 5, name: 'Italian' },
]

export function SelectWithClearButton() {
    return (
        <div className="w-full space-y-4">
            <BsSelect options={languages} isClearable />
        </div>
    )
}
