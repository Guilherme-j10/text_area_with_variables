import { useEffect, useRef } from "react";

export type useScrollReturnType = {
  verify_scroll_of_container: () => void;
}

type PropsUseScroll = {
  element: React.MutableRefObject<HTMLDivElement>,
  action_on_enabled?: () => void,
  action_on_disabled?: () => void
}

export const useScrollEnable = (props: PropsUseScroll): useScrollReturnType => {
  const old_state = useRef(null as unknown as boolean);

  const verify_scroll_of_container = (ignore_old_state?: boolean) => {
    const element = props.element.current;
    const is_scroll_enabled = element.scrollHeight > element.clientHeight;
    const ignore = typeof ignore_old_state === 'undefined' ? true : ignore_old_state;

    if (is_scroll_enabled && (ignore ? true : old_state.current !== true))
      if (typeof props.action_on_enabled === 'function')
        props.action_on_enabled();

    if (!is_scroll_enabled && (ignore ? false : old_state.current !== false))
      if (typeof props.action_on_disabled === 'function')
        props.action_on_disabled();

    old_state.current = is_scroll_enabled;
  }

  useEffect(() => {
    const handleContentInContainer = () => {
      verify_scroll_of_container(false);
    }

    window.addEventListener("keyup", handleContentInContainer);
    return () => {
      window.removeEventListener("keyup", handleContentInContainer);
    }
  }, []);

  return { verify_scroll_of_container };
}