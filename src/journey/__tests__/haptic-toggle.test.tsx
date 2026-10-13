import { act, type ReactTestRenderer } from 'react-test-renderer';
import { create } from 'react-test-renderer';

import { HapticToggle } from '../HapticToggle';

/**
 * Haptic toggle behavior tests. The toggle is small, calm, and
 * journey-appropriate: it only flips the hapticsEnabled input that the
 * journey-decision seam reads, muting every Haptic Cue at once.
 */
function renderToggle(
  enabled: boolean,
  onChange: (enabled: boolean) => void,
): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(<HapticToggle enabled={enabled} onChange={onChange} />);
  });
  return renderer;
}

describe('Haptic toggle (external behavior)', () => {
  test('toggle renders calmly with its current value', () => {
    const renderer = renderToggle(true, () => {});
    const toggle = renderer.root.findByProps({ testID: 'haptic-toggle' });
    expect(toggle).toBeTruthy();
    expect(toggle.props.value).toBe(true);
  });

  test('flipping the toggle notifies the Scroll Journey', () => {
    const onChange = jest.fn();
    const renderer = renderToggle(true, onChange);
    act(() => {
      renderer.root
        .findByProps({ testID: 'haptic-toggle' })
        .props.onValueChange(false);
    });
    expect(onChange).toHaveBeenCalledWith(false);
  });

  test('toggle stays accessible with a journey-appropriate label', () => {
    const renderer = renderToggle(false, () => {});
    const toggle = renderer.root.findByProps({ testID: 'haptic-toggle' });
    expect(toggle.props.accessibilityLabel).toMatch(/haptic/i);
  });
});
