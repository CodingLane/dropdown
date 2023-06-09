import * as Types from '../types';

export const filterOptions = (field: Types.DropdownOption, filter?: string | null) => {
    if (!filter || filter === null) return true;
    const parts = filter.toLowerCase().split(' ');
    return parts.every((part) => field.label.toLowerCase().includes(part));
};

export const createGroups = (options: Types.GroupedDropdownOption[], filter?: string | null) => {
    const groups = options
        .filter((option) => filterOptions(option, filter))
        .map((field) => field.group)
        .filter((group, index, self) => self.indexOf(group) === index);

    return groups;
};

export const mapToGroups = (options: Types.GroupedDropdownOption[], filter?: string | null) => {
    const groups = createGroups(options, filter);

    const mapped: Types.OptionGroup[] = [];

    groups.forEach((group) => {
        const groupOption = options
            .filter((option) => option.group === group)
            .filter((option) => filterOptions(option, filter))
            .map((option) => ({ value: option.value, label: option.label, favorite: option.favorite }));
        mapped.push({
            name: group,
            options: groupOption,
            isParent: false,
        });
    });
    return mapped.sort((left, right) => (left.name < right.name ? -1 : 1));
};

export const mapToGroupsWithFavorites = (
    options: Types.GroupedDropdownOption[],
    labels: Types.FavoriteLabels,
    filter?: string | null,
) => {
    const grouped = mapToGroups(options, filter);

    const favoriteGroup: Types.OptionGroup = {
        name: labels.favorite ?? 'Favorites',
        isParent: true,
        options: [],
    };

    const nonFavoriteGroup: Types.OptionGroup = {
        name: labels.nonFavorite ?? 'Standard',
        isParent: true,
        options: [],
    };

    grouped.forEach((group) => {
        if (group.isParent) throw new Error('We should not have a parent group!');

        const favOptions = group.options.filter((opt) => opt.favorite);
        const nonFavOptions = group.options.filter((opt) => !opt.favorite);
        if (favOptions.length > 0)
            favoriteGroup.options.push({
                ...group,
                options: favOptions,
            });
        if (nonFavOptions.length > 0)
            nonFavoriteGroup.options.push({
                ...group,
                options: nonFavOptions,
            });
    });

    return [favoriteGroup, nonFavoriteGroup];
};

export const mapToFavoriteGroup = (
    options: Types.DropdownOption[] | Types.GroupedDropdownOption[],
    labels: Types.FavoriteLabels,
    filter?: string | null,
) => {
    const favoriteGroup: Types.OptionGroup = {
        name: labels.favorite ?? 'Favorites',
        isParent: false,
        options: [],
    };

    const nonFavoriteGroup: Types.OptionGroup = {
        name: labels.nonFavorite ?? 'Standard',
        isParent: false,
        options: [],
    };

    options
        .filter((option) => filterOptions(option, filter))
        .forEach((option) => {
            if (option.favorite) favoriteGroup.options.push(option);
            else nonFavoriteGroup.options.push(option);
        });

    return [favoriteGroup, nonFavoriteGroup];
};

export const setStyleSheet = (style?: Types.DropdownStyleSheet) => {
    const doc = document.documentElement.style;
    doc.setProperty('--dropdownBackgroundColor', style?.dropdownBackgroundColor ?? 'white');
    doc.setProperty('--dropdownPrimaryColor', style?.color ?? 'black');
    doc.setProperty('--dropdownFontSize', style?.dropdownFontSize ?? '0.9em');
    doc.setProperty('--dropdownFontFamily', style?.dropdownFontFamily ?? "'Courier New', Courier, monospace");
};

export const getScrollbarWidth = () => {
    // Creating invisible container
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll'; // forcing scrollbar to appear
    (outer.style as any).msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    document.body.appendChild(outer);

    // Creating inner element and placing it in the container
    const inner = document.createElement('div');
    outer.appendChild(inner);

    // Calculating difference between container's full width and the child width
    const scrollbarHeight = outer.offsetHeight - inner.offsetHeight;

    // Removing temporary elements from the DOM
    (outer.parentNode as any).removeChild(outer);

    return scrollbarHeight;
};
