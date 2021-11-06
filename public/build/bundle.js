
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\MediaQuery.svelte generated by Svelte v3.42.2 */
    const get_default_slot_changes = dirty => ({ matches: dirty & /*matches*/ 1 });
    const get_default_slot_context = ctx => ({ matches: /*matches*/ ctx[0] });

    function create_fragment$8(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, matches*/ 9)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MediaQuery', slots, ['default']);
    	let { query } = $$props;
    	let mql;
    	let mqlListener;
    	let wasMounted = false;
    	let matches = false;

    	onMount(() => {
    		$$invalidate(2, wasMounted = true);

    		return () => {
    			removeActiveListener();
    		};
    	});

    	function addNewListener(query) {
    		mql = window.matchMedia(query);
    		mqlListener = v => $$invalidate(0, matches = v.matches);
    		mql.addListener(mqlListener);
    		$$invalidate(0, matches = mql.matches);
    	}

    	function removeActiveListener() {
    		if (mql && mqlListener) {
    			mql.removeListener(mqlListener);
    		}
    	}

    	const writable_props = ['query'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MediaQuery> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('query' in $$props) $$invalidate(1, query = $$props.query);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		query,
    		mql,
    		mqlListener,
    		wasMounted,
    		matches,
    		addNewListener,
    		removeActiveListener
    	});

    	$$self.$inject_state = $$props => {
    		if ('query' in $$props) $$invalidate(1, query = $$props.query);
    		if ('mql' in $$props) mql = $$props.mql;
    		if ('mqlListener' in $$props) mqlListener = $$props.mqlListener;
    		if ('wasMounted' in $$props) $$invalidate(2, wasMounted = $$props.wasMounted);
    		if ('matches' in $$props) $$invalidate(0, matches = $$props.matches);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*wasMounted, query*/ 6) {
    			{
    				if (wasMounted) {
    					removeActiveListener();
    					addNewListener(query);
    				}
    			}
    		}
    	};

    	return [matches, query, wasMounted, $$scope, slots];
    }

    class MediaQuery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { query: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MediaQuery",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*query*/ ctx[1] === undefined && !('query' in props)) {
    			console.warn("<MediaQuery> was created without expected prop 'query'");
    		}
    	}

    	get query() {
    		throw new Error("<MediaQuery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set query(value) {
    		throw new Error("<MediaQuery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\desktop\Navbar.svelte generated by Svelte v3.42.2 */

    const file$7 = "src\\desktop\\Navbar.svelte";

    function create_fragment$7(ctx) {
    	let header;
    	let img;
    	let img_src_value;
    	let header_resize_listener;

    	const block = {
    		c: function create() {
    			header = element("header");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "./logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1ef2sxt");
    			add_location(img, file$7, 5, 4, 100);
    			attr_dev(header, "class", "svelte-1ef2sxt");
    			add_render_callback(() => /*header_elementresize_handler*/ ctx[1].call(header));
    			add_location(header, file$7, 4, 0, 53);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, img);
    			header_resize_listener = add_resize_listener(header, /*header_elementresize_handler*/ ctx[1].bind(header));
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			header_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	let { headerHeight } = $$props;
    	const writable_props = ['headerHeight'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	function header_elementresize_handler() {
    		headerHeight = this.clientHeight;
    		$$invalidate(0, headerHeight);
    	}

    	$$self.$$set = $$props => {
    		if ('headerHeight' in $$props) $$invalidate(0, headerHeight = $$props.headerHeight);
    	};

    	$$self.$capture_state = () => ({ headerHeight });

    	$$self.$inject_state = $$props => {
    		if ('headerHeight' in $$props) $$invalidate(0, headerHeight = $$props.headerHeight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [headerHeight, header_elementresize_handler];
    }

    class Navbar$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { headerHeight: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*headerHeight*/ ctx[0] === undefined && !('headerHeight' in props)) {
    			console.warn("<Navbar> was created without expected prop 'headerHeight'");
    		}
    	}

    	get headerHeight() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headerHeight(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\desktop\Footer.svelte generated by Svelte v3.42.2 */

    const file$6 = "src\\desktop\\Footer.svelte";

    function create_fragment$6(ctx) {
    	let footer;
    	let div1;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div0;
    	let a1;
    	let p0;
    	let t2;
    	let p1;
    	let t4;
    	let span;
    	let a2;
    	let img1;
    	let img1_src_value;
    	let t5;
    	let a3;
    	let img2;
    	let img2_src_value;
    	let t6;
    	let a4;
    	let img3;
    	let img3_src_value;
    	let t7;
    	let a5;
    	let img4;
    	let img4_src_value;
    	let footer_resize_listener;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div1 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			div0 = element("div");
    			a1 = element("a");
    			p0 = element("p");
    			p0.textContent = "CACHEHO.IN";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "Copyright © 2021 CacheHo. All Rights Reserved.";
    			t4 = space();
    			span = element("span");
    			a2 = element("a");
    			img1 = element("img");
    			t5 = space();
    			a3 = element("a");
    			img2 = element("img");
    			t6 = space();
    			a4 = element("a");
    			img3 = element("img");
    			t7 = space();
    			a5 = element("a");
    			img4 = element("img");
    			if (!src_url_equal(img0.src, img0_src_value = "/images/CacheHo_Logo.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-26g0zx");
    			add_location(img0, file$6, 7, 12, 189);
    			attr_dev(a0, "href", "https://cacheho.in");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "svelte-26g0zx");
    			add_location(a0, file$6, 6, 8, 130);
    			attr_dev(p0, "class", "link svelte-26g0zx");
    			add_location(p0, file$6, 11, 17, 363);
    			attr_dev(a1, "href", "https://cacheho.in");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "svelte-26g0zx");
    			add_location(a1, file$6, 10, 12, 300);
    			attr_dev(p1, "class", "copyright");
    			add_location(p1, file$6, 13, 12, 425);
    			attr_dev(div0, "class", "link-copyright svelte-26g0zx");
    			add_location(div0, file$6, 9, 8, 258);
    			if (!src_url_equal(img1.src, img1_src_value = "/images/instagram.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "instagram icon");
    			attr_dev(img1, "class", "svelte-26g0zx");
    			add_location(img1, file$6, 19, 16, 663);
    			attr_dev(a2, "href", "https://instagram.com/cache_ho");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "class", "svelte-26g0zx");
    			add_location(a2, file$6, 18, 12, 588);
    			if (!src_url_equal(img2.src, img2_src_value = "/images/twitter.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "twitter icon");
    			attr_dev(img2, "class", "svelte-26g0zx");
    			add_location(img2, file$6, 22, 16, 824);
    			attr_dev(a3, "href", "https://twitter.com/cache_ho");
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "class", "svelte-26g0zx");
    			add_location(a3, file$6, 21, 12, 751);
    			if (!src_url_equal(img3.src, img3_src_value = "/images/linkedin.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "linkedin icon");
    			attr_dev(img3, "class", "svelte-26g0zx");
    			add_location(img3, file$6, 25, 16, 993);
    			attr_dev(a4, "href", "https://www.linkedin.com/company/cacheho");
    			attr_dev(a4, "target", "_blank");
    			attr_dev(a4, "class", "svelte-26g0zx");
    			add_location(a4, file$6, 24, 12, 908);
    			if (!src_url_equal(img4.src, img4_src_value = "/images/email.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "email icon");
    			attr_dev(img4, "class", "svelte-26g0zx");
    			add_location(img4, file$6, 28, 16, 1153);
    			attr_dev(a5, "href", "mailto:cacheho.team@gmail.com");
    			attr_dev(a5, "target", "_blank");
    			attr_dev(a5, "class", "svelte-26g0zx");
    			add_location(a5, file$6, 27, 12, 1079);
    			attr_dev(span, "class", "links svelte-26g0zx");
    			add_location(span, file$6, 17, 8, 554);
    			attr_dev(div1, "class", "footer svelte-26g0zx");
    			add_location(div1, file$6, 5, 4, 100);
    			attr_dev(footer, "class", "svelte-26g0zx");
    			add_render_callback(() => /*footer_elementresize_handler*/ ctx[1].call(footer));
    			add_location(footer, file$6, 4, 0, 53);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div1);
    			append_dev(div1, a0);
    			append_dev(a0, img0);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, a1);
    			append_dev(a1, p0);
    			append_dev(div0, t2);
    			append_dev(div0, p1);
    			append_dev(div1, t4);
    			append_dev(div1, span);
    			append_dev(span, a2);
    			append_dev(a2, img1);
    			append_dev(span, t5);
    			append_dev(span, a3);
    			append_dev(a3, img2);
    			append_dev(span, t6);
    			append_dev(span, a4);
    			append_dev(a4, img3);
    			append_dev(span, t7);
    			append_dev(span, a5);
    			append_dev(a5, img4);
    			footer_resize_listener = add_resize_listener(footer, /*footer_elementresize_handler*/ ctx[1].bind(footer));
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			footer_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	let { footerHeight } = $$props;
    	const writable_props = ['footerHeight'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	function footer_elementresize_handler() {
    		footerHeight = this.clientHeight;
    		$$invalidate(0, footerHeight);
    	}

    	$$self.$$set = $$props => {
    		if ('footerHeight' in $$props) $$invalidate(0, footerHeight = $$props.footerHeight);
    	};

    	$$self.$capture_state = () => ({ footerHeight });

    	$$self.$inject_state = $$props => {
    		if ('footerHeight' in $$props) $$invalidate(0, footerHeight = $$props.footerHeight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [footerHeight, footer_elementresize_handler];
    }

    class Footer$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { footerHeight: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*footerHeight*/ ctx[0] === undefined && !('footerHeight' in props)) {
    			console.warn("<Footer> was created without expected prop 'footerHeight'");
    		}
    	}

    	get footerHeight() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set footerHeight(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\desktop\Description.svelte generated by Svelte v3.42.2 */

    const file$5 = "src\\desktop\\Description.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let p0;
    	let br0;
    	let t2;
    	let strong0;
    	let t4;
    	let strong1;
    	let t6;
    	let i;
    	let t8;
    	let br1;
    	let t9;
    	let br2;
    	let t10;
    	let p1;
    	let t12;
    	let br3;
    	let t13;
    	let br4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Kudos!! You just made your day a little more productive by visiting us.";
    			t1 = space();
    			p0 = element("p");
    			br0 = element("br");
    			t2 = space();
    			strong0 = element("strong");
    			strong0.textContent = "\"How?\"";
    			t4 = text(" you ask. Factually, we are a group of engineers\r\n        and our idea is to bring a change in the scenario of\r\n        ");
    			strong1 = element("strong");
    			strong1.textContent = "“ENGINEERING”";
    			t6 = text("\r\n        in 2 states of India, Andhra Pradesh and Telangana that produce a lot\r\n        of engineers. We are doing this to prove that Engineering is an art and\r\n        not just a degree by bringing\r\n        ");
    			i = element("i");
    			i.textContent = "real engineering experiences, podcasts, technical blogs, and many\r\n            more";
    			t8 = text("\r\n        to the table. There you go then! Explore our page to understand the value\r\n        we provide.\r\n        ");
    			br1 = element("br");
    			t9 = space();
    			br2 = element("br");
    			t10 = space();
    			p1 = element("p");
    			p1.textContent = "Happy Engineering :)";
    			t12 = space();
    			br3 = element("br");
    			t13 = space();
    			br4 = element("br");
    			add_location(h2, file$5, 1, 4, 28);
    			add_location(br0, file$5, 8, 8, 210);
    			add_location(strong0, file$5, 9, 8, 226);
    			add_location(strong1, file$5, 11, 8, 369);
    			add_location(i, file$5, 15, 8, 608);
    			add_location(br1, file$5, 21, 8, 836);
    			add_location(br2, file$5, 21, 15, 843);
    			attr_dev(p0, "id", "text");
    			attr_dev(p0, "class", "svelte-61dsm2");
    			add_location(p0, file$5, 7, 4, 187);
    			add_location(p1, file$5, 24, 4, 867);
    			add_location(br3, file$5, 26, 4, 902);
    			add_location(br4, file$5, 26, 11, 909);
    			attr_dev(div, "id", "description");
    			attr_dev(div, "class", "svelte-61dsm2");
    			add_location(div, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(p0, br0);
    			append_dev(p0, t2);
    			append_dev(p0, strong0);
    			append_dev(p0, t4);
    			append_dev(p0, strong1);
    			append_dev(p0, t6);
    			append_dev(p0, i);
    			append_dev(p0, t8);
    			append_dev(p0, br1);
    			append_dev(p0, t9);
    			append_dev(p0, br2);
    			append_dev(div, t10);
    			append_dev(div, p1);
    			append_dev(div, t12);
    			append_dev(div, br3);
    			append_dev(div, t13);
    			append_dev(div, br4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Description', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Description> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Description extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Description",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\desktop\Buttons.svelte generated by Svelte v3.42.2 */

    const file$4 = "src\\desktop\\Buttons.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let a2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a0 = element("a");
    			a0.textContent = "Listen to our podcast";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "Read our blog";
    			t3 = space();
    			a2 = element("a");
    			a2.textContent = "Subscribe to our newsletter";
    			attr_dev(a0, "href", "https://podcast.cacheho.in");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "svelte-1u5wnm7");
    			add_location(a0, file$4, 1, 4, 28);
    			attr_dev(a1, "href", "https://blog.cacheho.in");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "svelte-1u5wnm7");
    			add_location(a1, file$4, 5, 4, 130);
    			attr_dev(a2, "href", "https://mailchi.mp/d70d6570e3ae/subscribe-to-newsletter");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "class", "svelte-1u5wnm7");
    			add_location(a2, file$4, 9, 4, 221);
    			attr_dev(div, "id", "buttons-row");
    			attr_dev(div, "class", "svelte-1u5wnm7");
    			add_location(div, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a0);
    			append_dev(div, t1);
    			append_dev(div, a1);
    			append_dev(div, t3);
    			append_dev(div, a2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Buttons', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Buttons> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Buttons$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Buttons",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\mobile\Navbar.svelte generated by Svelte v3.42.2 */

    const file$3 = "src\\mobile\\Navbar.svelte";

    function create_fragment$3(ctx) {
    	let header;
    	let img;
    	let img_src_value;
    	let header_resize_listener;

    	const block = {
    		c: function create() {
    			header = element("header");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-127glvt");
    			add_location(img, file$3, 5, 4, 100);
    			add_render_callback(() => /*header_elementresize_handler*/ ctx[1].call(header));
    			add_location(header, file$3, 4, 0, 53);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, img);
    			header_resize_listener = add_resize_listener(header, /*header_elementresize_handler*/ ctx[1].bind(header));
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			header_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	let { headerHeight } = $$props;
    	const writable_props = ['headerHeight'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	function header_elementresize_handler() {
    		headerHeight = this.clientHeight;
    		$$invalidate(0, headerHeight);
    	}

    	$$self.$$set = $$props => {
    		if ('headerHeight' in $$props) $$invalidate(0, headerHeight = $$props.headerHeight);
    	};

    	$$self.$capture_state = () => ({ headerHeight });

    	$$self.$inject_state = $$props => {
    		if ('headerHeight' in $$props) $$invalidate(0, headerHeight = $$props.headerHeight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [headerHeight, header_elementresize_handler];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { headerHeight: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*headerHeight*/ ctx[0] === undefined && !('headerHeight' in props)) {
    			console.warn("<Navbar> was created without expected prop 'headerHeight'");
    		}
    	}

    	get headerHeight() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headerHeight(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\mobile\Footer.svelte generated by Svelte v3.42.2 */

    const file$2 = "src\\mobile\\Footer.svelte";

    function create_fragment$2(ctx) {
    	let footer;
    	let div2;
    	let div0;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div1;
    	let span0;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let a2;
    	let img2;
    	let img2_src_value;
    	let t2;
    	let span1;
    	let a3;
    	let img3;
    	let img3_src_value;
    	let t3;
    	let a4;
    	let img4;
    	let img4_src_value;
    	let t4;
    	let div3;
    	let p;
    	let footer_resize_listener;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div2 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			span0 = element("span");
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			a2 = element("a");
    			img2 = element("img");
    			t2 = space();
    			span1 = element("span");
    			a3 = element("a");
    			img3 = element("img");
    			t3 = space();
    			a4 = element("a");
    			img4 = element("img");
    			t4 = space();
    			div3 = element("div");
    			p = element("p");
    			p.textContent = "Copyright © 2021 CacheHo. All Rights Reserved.";
    			if (!src_url_equal(img0.src, img0_src_value = "/images/CacheHo_Logo_Mobile.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "logo svelte-10kz2hv");
    			add_location(img0, file$2, 8, 16, 241);
    			attr_dev(a0, "href", "https://cacheho.in");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "svelte-10kz2hv");
    			add_location(a0, file$2, 7, 12, 178);
    			attr_dev(div0, "class", "logo-container svelte-10kz2hv");
    			add_location(div0, file$2, 6, 8, 136);
    			if (!src_url_equal(img1.src, img1_src_value = "/images/twitter.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "twitter icon");
    			attr_dev(img1, "class", "svelte-10kz2hv");
    			add_location(img1, file$2, 15, 20, 518);
    			attr_dev(a1, "href", "https://twitter.com/cache_ho");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "svelte-10kz2hv");
    			add_location(a1, file$2, 14, 16, 441);
    			if (!src_url_equal(img2.src, img2_src_value = "/images/instagram.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "instagram icon");
    			attr_dev(img2, "class", "svelte-10kz2hv");
    			add_location(img2, file$2, 18, 20, 689);
    			attr_dev(a2, "href", "https://instagram.com/cache_ho");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "class", "svelte-10kz2hv");
    			add_location(a2, file$2, 17, 16, 610);
    			attr_dev(span0, "class", "links svelte-10kz2hv");
    			add_location(span0, file$2, 13, 12, 403);
    			if (!src_url_equal(img3.src, img3_src_value = "/images/linkedin.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "linkedin icon");
    			attr_dev(img3, "class", "svelte-10kz2hv");
    			add_location(img3, file$2, 26, 20, 989);
    			attr_dev(a3, "href", "https://www.linkedin.com/company/cacheho");
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "class", "svelte-10kz2hv");
    			add_location(a3, file$2, 22, 16, 840);
    			if (!src_url_equal(img4.src, img4_src_value = "/images/email.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "email icon");
    			attr_dev(img4, "class", "svelte-10kz2hv");
    			add_location(img4, file$2, 29, 20, 1161);
    			attr_dev(a4, "href", "mailto:cacheho.team@gmail.com");
    			attr_dev(a4, "target", "_blank");
    			attr_dev(a4, "class", "svelte-10kz2hv");
    			add_location(a4, file$2, 28, 16, 1083);
    			attr_dev(span1, "class", "links svelte-10kz2hv");
    			add_location(span1, file$2, 21, 12, 802);
    			attr_dev(div1, "class", "links-container svelte-10kz2hv");
    			add_location(div1, file$2, 12, 8, 360);
    			attr_dev(div2, "class", "footer-child svelte-10kz2hv");
    			add_location(div2, file$2, 5, 4, 100);
    			add_location(p, file$2, 35, 8, 1324);
    			attr_dev(div3, "class", "link-copyright svelte-10kz2hv");
    			add_location(div3, file$2, 34, 4, 1286);
    			attr_dev(footer, "class", "svelte-10kz2hv");
    			add_render_callback(() => /*footer_elementresize_handler*/ ctx[1].call(footer));
    			add_location(footer, file$2, 4, 0, 53);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div2);
    			append_dev(div2, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, span0);
    			append_dev(span0, a1);
    			append_dev(a1, img1);
    			append_dev(span0, t1);
    			append_dev(span0, a2);
    			append_dev(a2, img2);
    			append_dev(div1, t2);
    			append_dev(div1, span1);
    			append_dev(span1, a3);
    			append_dev(a3, img3);
    			append_dev(span1, t3);
    			append_dev(span1, a4);
    			append_dev(a4, img4);
    			append_dev(footer, t4);
    			append_dev(footer, div3);
    			append_dev(div3, p);
    			footer_resize_listener = add_resize_listener(footer, /*footer_elementresize_handler*/ ctx[1].bind(footer));
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			footer_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	let { footerHeight } = $$props;
    	const writable_props = ['footerHeight'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	function footer_elementresize_handler() {
    		footerHeight = this.clientHeight;
    		$$invalidate(0, footerHeight);
    	}

    	$$self.$$set = $$props => {
    		if ('footerHeight' in $$props) $$invalidate(0, footerHeight = $$props.footerHeight);
    	};

    	$$self.$capture_state = () => ({ footerHeight });

    	$$self.$inject_state = $$props => {
    		if ('footerHeight' in $$props) $$invalidate(0, footerHeight = $$props.footerHeight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [footerHeight, footer_elementresize_handler];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { footerHeight: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*footerHeight*/ ctx[0] === undefined && !('footerHeight' in props)) {
    			console.warn("<Footer> was created without expected prop 'footerHeight'");
    		}
    	}

    	get footerHeight() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set footerHeight(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\mobile\Buttons.svelte generated by Svelte v3.42.2 */

    const file$1 = "src\\mobile\\Buttons.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let a2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a0 = element("a");
    			a0.textContent = "Listen to our podcast";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "Read our blog";
    			t3 = space();
    			a2 = element("a");
    			a2.textContent = "Subscribe to our newsletter";
    			attr_dev(a0, "href", "https://podcast.cacheho.in");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "svelte-nafn3s");
    			add_location(a0, file$1, 1, 4, 28);
    			attr_dev(a1, "href", "https://blog.cacheho.in");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "svelte-nafn3s");
    			add_location(a1, file$1, 5, 4, 130);
    			attr_dev(a2, "href", "https://mailchi.mp/d70d6570e3ae/subscribe-to-newsletter");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "class", "svelte-nafn3s");
    			add_location(a2, file$1, 9, 4, 221);
    			attr_dev(div, "id", "buttons-row");
    			attr_dev(div, "class", "svelte-nafn3s");
    			add_location(div, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a0);
    			append_dev(div, t1);
    			append_dev(div, a1);
    			append_dev(div, t3);
    			append_dev(div, a2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Buttons', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Buttons> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Buttons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Buttons",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.42.2 */
    const file = "src\\App.svelte";

    // (15:1) {#if matches}
    function create_if_block_1(ctx) {
    	let div1;
    	let navbar;
    	let t0;
    	let description;
    	let t1;
    	let buttons;
    	let t2;
    	let div0;
    	let t3;
    	let footer;
    	let current;
    	navbar = new Navbar$1({ $$inline: true });
    	description = new Description({ $$inline: true });
    	buttons = new Buttons$1({ $$inline: true });
    	footer = new Footer$1({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(description.$$.fragment);
    			t1 = space();
    			create_component(buttons.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			t3 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div0, "class", "fill svelte-1vzbtf9");
    			add_location(div0, file, 19, 3, 572);
    			attr_dev(div1, "class", "svelte-1vzbtf9");
    			add_location(div1, file, 15, 2, 511);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(navbar, div1, null);
    			append_dev(div1, t0);
    			mount_component(description, div1, null);
    			append_dev(div1, t1);
    			mount_component(buttons, div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div1, t3);
    			mount_component(footer, div1, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(description.$$.fragment, local);
    			transition_in(buttons.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(description.$$.fragment, local);
    			transition_out(buttons.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(navbar);
    			destroy_component(description);
    			destroy_component(buttons);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(15:1) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (14:0) <MediaQuery query="(min-width: 481px)" let:matches>
    function create_default_slot_1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*matches*/ ctx[0] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[0]) {
    				if (if_block) {
    					if (dirty & /*matches*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(14:0) <MediaQuery query=\\\"(min-width: 481px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (27:1) {#if matches}
    function create_if_block(ctx) {
    	let mobilenavbar;
    	let t0;
    	let description;
    	let t1;
    	let mobilebuttons;
    	let t2;
    	let mobilefooter;
    	let current;
    	mobilenavbar = new Navbar({ $$inline: true });
    	description = new Description({ $$inline: true });
    	mobilebuttons = new Buttons({ $$inline: true });
    	mobilefooter = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mobilenavbar.$$.fragment);
    			t0 = space();
    			create_component(description.$$.fragment);
    			t1 = space();
    			create_component(mobilebuttons.$$.fragment);
    			t2 = space();
    			create_component(mobilefooter.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mobilenavbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(description, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(mobilebuttons, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(mobilefooter, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mobilenavbar.$$.fragment, local);
    			transition_in(description.$$.fragment, local);
    			transition_in(mobilebuttons.$$.fragment, local);
    			transition_in(mobilefooter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mobilenavbar.$$.fragment, local);
    			transition_out(description.$$.fragment, local);
    			transition_out(mobilebuttons.$$.fragment, local);
    			transition_out(mobilefooter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mobilenavbar, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(description, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(mobilebuttons, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(mobilefooter, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(27:1) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (26:0) <MediaQuery query="(max-width: 480px)" let:matches>
    function create_default_slot(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*matches*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[0]) {
    				if (if_block) {
    					if (dirty & /*matches*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(26:0) <MediaQuery query=\\\"(max-width: 480px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let mediaquery0;
    	let t;
    	let mediaquery1;
    	let current;

    	mediaquery0 = new MediaQuery({
    			props: {
    				query: "(min-width: 481px)",
    				$$slots: {
    					default: [
    						create_default_slot_1,
    						({ matches }) => ({ 0: matches }),
    						({ matches }) => matches ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mediaquery1 = new MediaQuery({
    			props: {
    				query: "(max-width: 480px)",
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ matches }) => ({ 0: matches }),
    						({ matches }) => matches ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(mediaquery0.$$.fragment);
    			t = space();
    			create_component(mediaquery1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(mediaquery0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(mediaquery1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const mediaquery0_changes = {};

    			if (dirty & /*$$scope, matches*/ 3) {
    				mediaquery0_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery0.$set(mediaquery0_changes);
    			const mediaquery1_changes = {};

    			if (dirty & /*$$scope, matches*/ 3) {
    				mediaquery1_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery1.$set(mediaquery1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mediaquery0.$$.fragment, local);
    			transition_in(mediaquery1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mediaquery0.$$.fragment, local);
    			transition_out(mediaquery1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mediaquery0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(mediaquery1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		MediaQuery,
    		Navbar: Navbar$1,
    		Footer: Footer$1,
    		Description,
    		Buttons: Buttons$1,
    		MobileNavbar: Navbar,
    		MobileFooter: Footer,
    		MobileButtons: Buttons
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
