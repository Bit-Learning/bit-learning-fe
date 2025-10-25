import { Button } from '@workspace/ui/components/Button'
import { Menu, MenuItem, MenuKeyboard, MenuPopover, MenuTrigger } from '@workspace/ui/components/Menu'

export function MenuWithKeyboard() {
    return (
        <MenuTrigger>
            <Button variant="outline">Shortcuts</Button>
            <MenuPopover>
                <Menu>
                    <MenuItem>
                        New Tab <MenuKeyboard>⌘T</MenuKeyboard>
                    </MenuItem>
                    <MenuItem>
                        Close Tab <MenuKeyboard>⌘W</MenuKeyboard>
                    </MenuItem>
                </Menu>
            </MenuPopover>
        </MenuTrigger>
    )
}
